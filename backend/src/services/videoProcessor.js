import Video from "../models/Video.js";
import { emitProgress } from "./socket.service.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "@ffmpeg-installer/ffmpeg";
import ffprobeStatic from "@ffprobe-installer/ffprobe";
import path from "path";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

ffmpeg.setFfmpegPath(ffmpegStatic.path);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const SIGHTENGINE_URL = "https://api.sightengine.com/1.0/check.json";
const MAX_API_RETRIES = 2;

export const processVideo = async (videoId, userId) => {
  let video;
  let baseDir;
  let videoPath;

  console.log(" Starting video processing:", videoId);

  try {
    /* ================= DB FETCH ================= */
    video = await Video.findById(videoId);
    if (!video) throw new Error("Video not found");

    emitProgress(userId, { videoId, progress: 0, status: "processing" });

    //  Calculate full path to video using filename from DB
    videoPath = path.join(process.cwd(), "src", "uploads", video.filename);
    if (!fs.existsSync(videoPath))
      throw new Error("Video file missing on server");

    baseDir = path.join(process.cwd(), "src", "temp", videoId.toString());
    fs.mkdirSync(baseDir, { recursive: true });

    /* ================= FRAME EXTRACTION ================= */
    console.log(" Extracting frames...");
    emitProgress(userId, { videoId, progress: 20 });

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ["10%", "30%", "50%", "70%", "90%"],
          folder: baseDir,
          size: "640x360",
          filename: "frame-%i.png",
        })
        .on("end", () => {
          console.log(" Frame extraction completed");
          resolve();
        })
        .on("error", (err) => {
          console.error(" FFmpeg error:", err.message);
          reject(err);
        });
    });

    /* ================= VISION AI ================= */
    emitProgress(userId, { videoId, progress: 50 });

    const frames = fs.readdirSync(baseDir).filter((f) => f.endsWith(".png"));
    console.log(` Total frames to analyze: ${frames.length}`);

    let nuditySum = 0;
    let weaponSum = 0;
    let analyzed = 0;
    let violations = [];
    let failedFrames = 0;

    for (const frame of frames) {
      const framePath = path.join(baseDir, frame);
      console.log(` Analyzing frame: ${frame}`);

      let attempt = 0;
      let success = false;

      while (attempt <= MAX_API_RETRIES && !success) {
        attempt++;

        try {
          const form = new FormData();
          form.append("media", fs.createReadStream(framePath));
          form.append("models", "nudity,weapon");
          form.append("api_user", process.env.SIGHTENGINE_USER);
          form.append("api_secret", process.env.SIGHTENGINE_SECRET);

          const response = await axios.post(SIGHTENGINE_URL, form, {
            headers: form.getHeaders(),
            timeout: 20000,
          });

          const data = response.data;
          console.log(" API response:", JSON.stringify(data));

          if (!data?.nudity) throw new Error("Invalid Sightengine response");

          const nudity = Number(data.nudity.raw || 0);
          const weapon =
            typeof data.weapon === "object"
              ? Math.max(...Object.values(data.weapon.classes || {}))
              : Number(data.weapon || 0);

          console.log(
            ` Scores → nudity=${nudity.toFixed(3)}, weapon=${weapon.toFixed(3)}`
          );

          nuditySum += nudity;
          weaponSum += weapon;
          analyzed++;
          success = true;

          if (nudity > 0.6 || weapon > 0.5) {
            violations.push({
              frame,
              nudity: Math.round(nudity * 100),
              weapon: Math.round(weapon * 100),
            });
          }
        } catch (err) {
          console.error(
            ` API error (attempt ${attempt}) for frame ${frame}:`,
            err.message
          );
          if (attempt > MAX_API_RETRIES) {
            failedFrames++;
            console.warn(` Frame skipped due to repeated failures`);
          }
        }
      }
    }

    console.log(
      ` Frames analyzed: ${analyzed}, Failed frames: ${failedFrames}`
    );

    /* ================= SCORE ENGINE ================= */
    emitProgress(userId, { videoId, progress: 80 });

    if (analyzed === 0) throw new Error("No frames successfully analyzed");

    const nudityScore = nuditySum / analyzed;
    const weaponScore = weaponSum / analyzed;
    const riskScore = nudityScore * 0.5 + weaponScore * 0.35;

    console.log(
      ` Final Scores → nudity=${nudityScore.toFixed(
        3
      )}, weapon=${weaponScore.toFixed(3)}, risk=${riskScore.toFixed(3)}`
    );

    /* ================= POLICY ENGINE ================= */
    if (riskScore >= 0.7) {
      video.status = "blocked";
    } else if (riskScore >= 0.4) {
      video.status = "review_required";
    } else {
      video.status = "published";
    }

    video.riskScore = Math.round(riskScore * 100);
    video.violations = violations;
    video.analysisMeta = {
      analyzedFrames: analyzed,
      failedFrames,
      model: "sightengine:nudity+weapon",
    };

    /*  FIXED: VersionError Protection */
    try {
      await video.save();
      console.log(" VIDEO PROCESSED:", video._id, "risk:", video.riskScore);
    } catch (error) {
      if (
        error.name === "VersionError" ||
        error.message.includes("No matching document")
      ) {
        console.log(" Video deleted during processing, skipping save");
        return; // Video was deleted, no problem!
      }
      console.error(" PROCESS SAVE ERROR:", error.message);
      throw error;
    }

    emitProgress(userId, {
      videoId,
      progress: 100,
      status: video.status,
      riskScore: video.riskScore,
    });

    console.log(
      ` FINAL STATUS: ${video.status.toUpperCase()} | Risk=${video.riskScore}%`
    );
  } catch (err) {
    console.error(" Processing failed:", err.message);

    if (video) {
      video.status = "flagged"; //  DB enum-safe status
      video.errorReason = err.message;

      /*  Also protect catch block save */
      try {
        await video.save();
      } catch (saveError) {
        if (
          saveError.name === "VersionError" ||
          saveError.message.includes("No matching document")
        ) {
          console.log(" Video deleted during error handling, skipping");
        } else {
          console.error(" ERROR SAVE FAILED:", saveError.message);
        }
      }
    }

    emitProgress(userId, {
      videoId,
      progress: 100,
      status: "flagged",
      message: err.message,
    });
  } finally {
    if (baseDir && fs.existsSync(baseDir)) {
      fs.rmSync(baseDir, { recursive: true, force: true });
      console.log(" Temp files cleaned");
    }
  }
};

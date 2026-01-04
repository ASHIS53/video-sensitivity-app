import Video from "../models/Video.js";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { processVideo } from "../services/videoProcessor.js";

export const uploadVideo = async (req, res) => {
  try {
    console.log(" UPLOAD START:", req.file?.filename, req.user.id);

    //  : Extract ObjectId from tenantId
    const tenantId = req.user.tenantId?._id || req.user.tenantId;

    const video = await Video.create({
      owner: req.user.id,
      tenantId: tenantId, //  NOW CORRECT ObjectId
      filename: req.file.filename,
      size: req.file.size,
      title: req.body.title || "Untitled Video",
      description: req.body.description || "",
    });

    console.log(" VIDEO CREATED:", video._id, "File:", req.file.filename);
    processVideo(video._id, req.user.id);
    res.json({ message: "Video uploaded successfully", video });
  } catch (error) {
    console.error(" UPLOAD ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

//  NEW ROLE-BASED GET VIDEOS
//  : Viewers see PUBLISHED videos
export const getVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    //  : Extract ObjectId for queries
    const tenantId = req.user.tenantId?._id || req.user.tenantId;

    console.log(" GET VIDEOS:", userId, role, tenantId);

    const allTenantVideos = await Video.find({ tenantId }).lean();
    console.log(
      " ALL TENANT VIDEOS:",
      allTenantVideos.length,
      "statuses:",
      allTenantVideos.map((v) => v.status)
    );

    let query = { tenantId };

    if (role === "viewer") {
      query.status = "published";
    } else {
      //  Editors/Admins: ALL tenant videos
      query = { tenantId };
    }

    const videos = await Video.find(query)
      .populate("owner", "name email")
      .populate("assignedUsers", "name email")
      .sort({ createdAt: -1 });

    console.log(" FOUND VIDEOS:", videos.length, "for role:", role);
    res.json(videos);
  } catch (error) {
    console.error(" GET VIDEOS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

//  NEW: UPDATE VIDEO METADATA
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignedUsers } = req.body;

    //  : Extract ObjectId
    const tenantId = req.user.tenantId?._id || req.user.tenantId;

    console.log(
      "✏️ UPDATE VIDEO:",
      id,
      "by",
      req.user.id,
      "role:",
      req.user.role
    );

    const video = await Video.findOne({
      _id: id,
      tenantId: tenantId, //
      $or: [{ owner: req.user.id }, { assignedUsers: req.user.id }],
    });

    if (!video) {
      return res
        .status(403)
        .json({ message: "Video not found or access denied" });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.status = status || video.status;
    if (assignedUsers) video.assignedUsers = assignedUsers;

    await video.save();
    const populatedVideo = await Video.findById(id)
      .populate("owner", "name email")
      .populate("assignedUsers", "name email");

    console.log(" VIDEO UPDATED:", video._id);
    res.json(populatedVideo);
  } catch (err) {
    console.error(" UPDATE VIDEO ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

//  NEW: DELETE VIDEO
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    //  : Extract ObjectId
    const tenantId = req.user.tenantId?._id || req.user.tenantId;

    console.log("DELETE VIDEO:", id, "by", req.user.id);

    const video = await Video.findOne({
      _id: id,
      tenantId: tenantId, //
      $or: [{ owner: req.user.id }, { assignedUsers: req.user.id }],
    });

    if (!video) {
      return res
        .status(404)
        .json({ message: "Video not found or access denied" });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), "src", "uploads", video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(" FILE DELETED:", video.filename);
    }

    await Video.findByIdAndDelete(id);
    console.log(" VIDEO DELETED:", id);
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    console.error(" DELETE VIDEO ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

//  ORIGINAL PRIVATE STREAM (requires auth middleware)
export const streamVideo = async (req, res) => {
  try {
    console.log(" PRIVATE STREAM:", req.params.id, "User:", req.user.id);

    //  : Extract ObjectId
    const tenantId = req.user.tenantId?._id || req.user.tenantId;

    const video = await Video.findOne({
      _id: req.params.id,
      tenantId: tenantId, //
      $or: [{ owner: req.user.id }, { assignedUsers: req.user.id }],
    });

    if (!video) {
      console.log(" PRIVATE VIDEO NOT FOUND:", req.params.id);
      return res.status(404).json({ message: "Video not found" });
    }

    const filePath = path.join(process.cwd(), "src", "uploads", video.filename);
    console.log(" PRIVATE FILE PATH:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log(" PRIVATE FILE MISSING:", filePath);
      return res.status(404).json({ message: "File not found" });
    }

    console.log(
      " PRIVATE STREAM START:",
      video.filename,
      "Size:",
      fs.statSync(filePath).size
    );

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      console.log("📡 PRIVATE RANGE:", `${start}-${end}/${stat.size}`);

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      console.log("📡 PRIVATE FULL:", stat.size);
      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error(" PRIVATE STREAM ERROR:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

//  PUBLIC STREAM - Uses query token (for video tag)
export const getPublicVideoStream = async (req, res) => {
  try {
    console.log(" PUBLIC STREAM HIT:", req.params.id);
    const token = req.query.token;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(
      " TOKEN DECODED:",
      decoded.id,
      "Role:",
      decoded.role,
      "Tenant:",
      decoded.tenantId
    );

    //  Role-based access
    let videoQuery = {
      _id: req.params.id,
      tenantId: decoded.tenantId, // JWT already has correct tenantId
    };

    if (decoded.role === "viewer") {
      videoQuery.status = "published";
    }

    const video = await Video.findOne(videoQuery);

    if (!video) {
      console.log(" VIDEO NOT FOUND. Query:", videoQuery);
      return res
        .status(404)
        .json({ message: "Video not found or access denied" });
    }

    console.log(
      " VIDEO FOUND:",
      video._id,
      "Owner:",
      video.owner,
      "Status:",
      video.status
    );

    const filePath = path.join(process.cwd(), "src", "uploads", video.filename);

    if (!fs.existsSync(filePath)) {
      console.log(" FILE MISSING:", filePath);
      return res.status(404).json({ message: "File not found" });
    }

    console.log(
      " STREAMING:",
      video.filename,
      "Size:",
      fs.statSync(filePath).size
    );

    // Video streaming (unchanged)
    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error(" PUBLIC STREAM ERROR:", err.message);
    res.status(401).json({ message: "Stream error" });
  }
};

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import auth from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  uploadVideo,
  getVideos,
  streamVideo,
  getPublicVideoStream,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";

const router = express.Router();

//   MULTER with ABSOLUTE PATH
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "src", "uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files allowed"), false);
  },
});

/*  ROUTES WITH PROPER ROLE PROTECTION */
router.get("/public-stream/:id", getPublicVideoStream); // Public with token
router.get("/", auth, getVideos); //  Role-based access
router.post(
  "/upload",
  auth,
  allowRoles("editor", "admin"),
  upload.single("video"),
  uploadVideo
); // Editor+
router.get("/stream/:id", auth, streamVideo); // Authenticated users
router.put("/:id", auth, allowRoles("editor", "admin"), updateVideo); //  NEW Editor+
router.delete("/:id", auth, allowRoles("editor", "admin"), deleteVideo); //  NEW Editor+

export default router;

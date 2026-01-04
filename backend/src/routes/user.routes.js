import express from "express";
import auth from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { getAllUsers, updateUserRole } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", auth, allowRoles("admin"), getAllUsers);
router.put("/:id/role", auth, allowRoles("admin"), updateUserRole);

export default router;

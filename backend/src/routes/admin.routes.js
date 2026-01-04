import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  getAllVideos,
  reassignUserTenant,
  updateUserRole, //  Role change
  getAllTenants,
  createTenant,
  updateTenant,
  deleteTenant,
} from "../controllers/admin.controller.js";

const router = express.Router();

//  USERS
router.get("/users", auth, getAllUsers);
router.post("/users/reassign-tenant", auth, reassignUserTenant);
router.put("/users/:id/role", auth, updateUserRole); //  Role change

//  VIDEOS
router.get("/videos", auth, getAllVideos);

//  TENANTS
router.get("/tenants", auth, getAllTenants);
router.post("/tenants", auth, createTenant);
router.put("/tenants/:id", auth, updateTenant);
router.delete("/tenants/:id", auth, deleteTenant);

export default router;

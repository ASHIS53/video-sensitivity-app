import express from "express";
import auth from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  createTenant,
  getTenants,
  getTenantStats,
} from "../controllers/tenant.controller.js";

const router = express.Router();

router.post("/", auth, allowRoles("admin"), createTenant);
router.get("/", auth, allowRoles("admin"), getTenants);
router.get("/stats", auth, getTenantStats);

export default router;

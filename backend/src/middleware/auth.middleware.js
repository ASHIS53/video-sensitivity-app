import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

export default async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    //  : Get tenantId as STRING only (NO populate)
    const tenantId = user.tenantId.toString();

    // Fetch tenant name separately (don't populate)
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    req.user = {
      id: user._id.toString(),
      role: user.role,
      tenantId: tenantId, //  STRING ObjectId ONLY
      tenantName: tenant.name,
      organization: tenant.organization,
    };

    console.log(" Auth user:", req.user);
    next();
  } catch (error) {
    console.error(" Auth error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

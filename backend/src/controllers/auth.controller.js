import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "viewer", tenantId } = req.body;
    const hash = await bcrypt.hash(password, 10);

    // Validate tenant exists or create default
    let tenant;
    if (tenantId) {
      tenant = await Tenant.findById(tenantId);
      if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    } else {
      tenant = await Tenant.findOne({ name: "default" });
      if (!tenant) {
        tenant = await Tenant.create({ name: "default" });
      }
    }

    const user = await User.create({
      name,
      email,
      password: hash,
      role,
      tenantId: tenant._id,
    });

    // Update tenant user count
    tenant.userCount += 1;
    await tenant.save();

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        tenantId: user.tenantId.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: tenant._id,
        tenantName: tenant.name,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        tenantId: user.tenantId.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const tenant = await Tenant.findById(user.tenantId);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: tenant?.name || "default",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

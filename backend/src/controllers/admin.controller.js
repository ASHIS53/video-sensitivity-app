import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import Video from "../models/Video.js";

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const users = await User.find({})
      .populate({
        path: "tenantId",
        select: "name organization",
      })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const videos = await Video.find({})
      .populate("owner", "name email")
      .populate("assignedUsers", "name email")
      .populate("tenantId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reassignUserTenant = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { userId, tenantId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // Update old tenant stats
    const oldTenant = await Tenant.findById(user.tenantId);
    if (oldTenant) {
      oldTenant.userCount = Math.max(0, oldTenant.userCount - 1);
      await oldTenant.save();
    }

    // REASSIGN USER
    user.tenantId = tenantId;
    user.tenantName = tenant.name;
    await user.save();

    // Update new tenant stats
    tenant.userCount += 1;
    await tenant.save();

    console.log(
      ` Admin reassigned ${user.email} from ${oldTenant?.name || "default"} → ${
        tenant.name
      }`
    );

    res.json({
      success: true,
      message: `User reassigned to ${tenant.name}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        oldTenant: oldTenant?.name || "default",
        newTenant: tenant.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  CHANGE USER ROLE (Fixes PUT /admin/users/:id/role 404)
export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { role } = req.body;
    const userId = req.params.id;

    if (!["viewer", "editor", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role: viewer, editor, or admin only" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(` Admin changed ${user.email} role to ${role}`);

    res.json({
      success: true,
      message: `Role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  TENANT FUNCTIONS
export const getAllTenants = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const tenants = await Tenant.find();

    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => ({
        _id: tenant._id,
        name: tenant.name,
        organization: tenant.organization || "",
        userCount: await User.countDocuments({ tenantId: tenant._id }),
        videoCount: await Video.countDocuments({ tenantId: tenant._id }),
      }))
    );

    res.json({ tenants: tenantsWithStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTenant = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { name, organization } = req.body;

    const existingTenant = await Tenant.findOne({ name });
    if (existingTenant) {
      return res.status(400).json({ message: "Tenant name already exists" });
    }

    const tenant = new Tenant({
      name,
      organization: organization || "",
      userCount: 0,
      videoCount: 0,
    });
    await tenant.save();

    res.status(201).json({ message: "Tenant created", tenant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTenant = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { name, organization } = req.body;

    const existingTenant = await Tenant.findOne({ name });
    if (existingTenant && existingTenant._id.toString() !== req.params.id) {
      return res.status(400).json({ message: "Tenant name already exists" });
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { name, organization },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({ message: "Tenant updated", tenant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    await Tenant.findByIdAndDelete(req.params.id);
    res.json({ message: "Tenant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

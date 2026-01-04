import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
// Create new tenant (Admin only)
export const createTenant = async (req, res) => {
  try {
    const { name, organization } = req.body;

    // Check if tenant exists
    const existingTenant = await Tenant.findOne({ name });
    if (existingTenant) {
      return res.status(400).json({ message: "Tenant name already exists" });
    }

    const tenant = await Tenant.create({
      name,
      organization,
      // Track tenant stats
      userCount: 0,
      videoCount: 0,
    });

    res.status(201).json({
      success: true,
      tenant: {
        id: tenant._id,
        name: tenant.name,
        organization: tenant.organization,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tenants (Super Admin only) or current tenant info
export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({}).select("-__v");
    res.json({ success: true, tenants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current tenant dashboard stats
export const getTenantStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const stats = await Promise.all([
      User.countDocuments({ tenantId }),
      Tenant.findById(tenantId).select("userCount videoCount"),
    ]);

    res.json({
      success: true,
      stats: {
        users: stats[0],
        tenantInfo: stats[1],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

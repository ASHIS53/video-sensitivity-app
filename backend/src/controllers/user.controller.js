import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    //  Tenant admins see only their tenant
    if (req.user.role === "admin") {
      const users = await User.find({ tenantId: req.user.tenantId }).select(
        "-password"
      );
      res.json({ success: true, users });
    } else {
      res.status(403).json({ message: "Admin access only" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId, //  SECURITY
      },
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or not in your tenant",
      });
    }

    res.json({
      success: true,
      message: "Role updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

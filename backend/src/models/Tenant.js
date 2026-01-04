import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    organization: { type: String },
    // Stats tracking
    userCount: { type: Number, default: 0 },
    videoCount: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 },
    // Config
    settings: {
      maxUsers: { type: Number, default: 100 },
      maxStorage: { type: Number, default: 10 * 1024 * 1024 * 1024 }, // 10GB
      allowPublicVideos: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Auto-update stats (pre-save hook)
tenantSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.userCount = await mongoose
      .model("User")
      .countDocuments({ tenantId: this._id });
    this.videoCount = await mongoose
      .model("Video")
      .countDocuments({ tenantId: this._id });
  }
  next();
});

export default mongoose.model("Tenant", tenantSchema);

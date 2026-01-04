import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    filename: { type: String, required: true },

    //  NEW FIELDS FOR MANAGEMENT
    title: { type: String, default: "Untitled Video" },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "processing",
        "draft",
        "published",
        "archived",
        "safe",
        "flagged",
        "error",
      ],
      default: "draft",
    },
    thumbnail: { type: String },
    duration: Number,
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    size: { type: Number, required: true },

    //  NEW AI MODERATION FIELDS
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    violations: [
      {
        frame: String,
        nudity: String,
        gore: String,
        weapons: String,
        risk: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);

import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["youtube", "link"], default: "link" },
    section: {
      type: String,
      enum: ["frontend", "backend", "database", "fundamentals", "interview-prep", "other"],
      default: "other",
    },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Resource ?? mongoose.model("Resource", ResourceSchema);

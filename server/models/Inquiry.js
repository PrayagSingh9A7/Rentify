import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    contacted: {
      type: Boolean,
      default: false,
    },

    reply: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    repliedAt: Date,
  },
  {
    timestamps: true,
  }
);

inquirySchema.index({
  property: 1,
  owner: 1,
  user: 1,
});

inquirySchema.index({ owner: 1, createdAt: -1 });
inquirySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Inquiry", inquirySchema);

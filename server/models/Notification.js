import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "BOOKING",
        "INQUIRY",
        "PROPERTY",
        "REVIEW",
        "SYSTEM",
      ],
      default: "SYSTEM",
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    referenceModel: {
      type: String,
      enum: [
        "Booking",
        "Inquiry",
        "Property",
        "Review",
      ],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: Date,

    icon: {
      type: String,
      default: "bell",
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
    recipient:1,
    createdAt:-1
});

export default mongoose.model(
    "Notification",
    notificationSchema
);
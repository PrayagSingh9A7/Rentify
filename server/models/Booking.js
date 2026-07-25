import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    visitDate: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      default: "Property Visit",
      trim: true,
    },

    message: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    approvedAt: Date,

    completedAt: Date,

    cancelledAt: Date,

    rejectedAt: Date,

    isVisited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index(
  { property: 1, visitDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
  }
);

bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ tenant: 1, createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);

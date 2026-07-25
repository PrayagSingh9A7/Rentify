import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";
import { createNotification } from "../services/notification.service.js";
export const createInquiry = async (req, res) => {
  try {
    if (!req.body.property) {
      return res.status(400).json({ success: false, message: "Property is required" });
    }

    const property = await Property.findById(req.body.property);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot inquire about your own property",
      });
    }

    const inquiry = await Inquiry.create({
      property: property._id,
      owner: property.owner,
      user: req.user.id,
      phone: req.body.phone,
      message: req.body.message,
    });

    await Property.findByIdAndUpdate(property._id, { $inc: { inquiryCount: 1 } });

    await createNotification({
  recipient: property.owner,
  sender: req.user.id,
  title: "New Inquiry",
  message: "Someone has inquired about your property.",
  type: "INQUIRY",
  referenceId: inquiry._id,
  referenceModel: "Inquiry",
  icon: "message-circle",
});
    res.status(201).json({
      success: true,
      data: inquiry,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
export const getMyInquiries = async (req, res) => {

  try {

    const inquiries = await Inquiry.find({
      user: req.user.id,
    })

      .populate("property")
      .populate("owner", "name phone email")

      .sort("-createdAt");

    res.json({
      success: true,
      data: inquiries,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

export const getOwnerInquiries = async (req, res) => {

  try {

    const inquiries = await Inquiry.find({
      owner: req.user.id,
    })

      .populate("property")
      .populate("user", "name email phone avatar")

      .sort("-createdAt");

    res.json({
      success: true,
      data: inquiries,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

export const updateInquiryStatus = async (req, res) => {

  try {

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {

      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });

    }

    if (inquiry.owner.toString() !== req.user.id) {

      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });

    }

    const allowedStatuses = ["pending", "accepted", "rejected"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry status",
      });
    }

    inquiry.status = req.body.status;

    inquiry.isRead = true;

    await inquiry.save();

    res.json({
      success: true,
      data: inquiry,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

export const replyInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    if (inquiry.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const reply = typeof req.body.reply === "object" ? req.body.reply?.reply : req.body.reply;
    if (!reply?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply is required",
      });
    }

    inquiry.reply = reply.trim();
    inquiry.repliedAt = new Date();
    inquiry.status = "accepted";
    inquiry.isRead = true;
    await inquiry.save();

    await createNotification({
      recipient: inquiry.user,
      sender: req.user.id,
      title: "Owner replied to your inquiry",
      message: inquiry.reply,
      type: "INQUIRY",
      referenceId: inquiry._id,
      referenceModel: "Inquiry",
      icon: "message-circle",
    });

    await inquiry.populate("property");
    await inquiry.populate("user", "name email phone avatar");

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    const isOwner = inquiry.owner.toString() === req.user.id;
    const isUser = inquiry.user.toString() === req.user.id;
    if (!isOwner && !isUser && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await inquiry.deleteOne();

    res.json({
      success: true,
      message: "Inquiry deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


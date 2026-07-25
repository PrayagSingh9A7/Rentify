import Notification from "../models/Notification.js";
import { notFound } from "../utils/AppError.js";

/**
 * Create Notification
 */
export const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = "SYSTEM",
  referenceId = null,
  referenceModel = null,
  icon = "bell",
}) => {
  return Notification.create({
    recipient,
    sender,
    title,
    message,
    type,
    referenceId,
    referenceModel,
    icon,
  });
};

/**
 * Get User Notifications
 */
export const getNotifications = async (
  userId,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({
    recipient: userId,
  })
    .populate("sender", "name avatar")
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({
    recipient: userId,
  });

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Unread Count
 */
export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

/**
 * Mark Read
 */
export const markAsRead = async (
  notificationId,
  userId
) => {

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw notFound("Notification not found");
  }

  notification.isRead = true;
  notification.readAt = new Date();

  await notification.save();

  return notification;
};

/**
 * Mark All Read
 */
export const markAllAsRead = async (userId) => {

  await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  return true;
};

/**
 * Delete Notification
 */
export const deleteNotification = async (
  notificationId,
  userId
) => {

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw notFound("Notification not found");
  }

  await notification.deleteOne();

  return true;
};

/**
 * Delete All Notifications
 */
export const clearNotifications = async (
  userId
) => {

  await Notification.deleteMany({
    recipient: userId,
  });

  return true;
};

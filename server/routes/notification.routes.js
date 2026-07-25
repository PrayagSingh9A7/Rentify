import express from "express";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notification.controller.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Get all notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark one as read
router.put("/:id/read", markAsRead);
router.patch("/:id/read", markAsRead);

// Mark all as read
router.put("/read-all", markAllAsRead);
router.patch("/read-all", markAllAsRead);

// Delete one notification
router.delete("/:id", deleteNotification);

// Delete all notifications
router.delete("/", clearNotifications);

export default router;

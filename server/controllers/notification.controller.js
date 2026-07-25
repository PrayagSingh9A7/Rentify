import * as notificationService from "../services/notification.service.js";

/**
 * GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const result = await notificationService.getNotifications(
      req.user.id,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.notifications,
      notifications: result.notifications,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        pages: result.totalPages,
        totalPages: result.totalPages,
      },
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/**
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {

  try {

    const count = await notificationService.getUnreadCount(
      req.user.id
    );

    res.status(200).json({

      success: true,

      count,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

/**
 * PUT /api/notifications/:id/read
 */
export const markAsRead = async (req, res) => {

  try {

    const notification =
      await notificationService.markAsRead(
        req.params.id,
        req.user.id
      );

    res.status(200).json({

      success: true,

      message: "Notification marked as read.",

      data: notification,

    });

  } catch (error) {

    res.status(error.statusCode || 400).json({

      success: false,

      message: error.message,

    });

  }

};

/**
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = async (req, res) => {

  try {

    await notificationService.markAllAsRead(
      req.user.id
    );

    res.status(200).json({

      success: true,

      message: "All notifications marked as read.",

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

/**
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res) => {

  try {

    await notificationService.deleteNotification(
      req.params.id,
      req.user.id
    );

    res.status(200).json({

      success: true,

      message: "Notification deleted.",

    });

  } catch (error) {

    res.status(error.statusCode || 400).json({

      success: false,

      message: error.message,

    });

  }

};

/**
 * DELETE /api/notifications
 */
export const clearNotifications = async (req, res) => {

  try {

    await notificationService.clearNotifications(
      req.user.id
    );

    res.status(200).json({

      success: true,

      message: "All notifications cleared.",

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

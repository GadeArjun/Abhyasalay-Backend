// routers/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  resendPendingNotifications,
} = require("../controllers/notification.controller");


// GET /api/notifications?read=false&page=1&limit=20
router.get("/", getNotifications);

// POST /api/notifications/:id/read
router.post("/:id/read", markAsRead);

// DELETE /api/notifications/:id
router.delete("/:id", deleteNotification);

// POST /api/notifications/resend-pending
// (optional manual trigger; we’ll also cron‐schedule it)
router.post("/resend-pending", resendPendingNotifications);

exports.notificationsRouter = router;

const Notification = require("../models/Notification");
const DeviceToken = require("../models/DeviceToken");
const { sendNotification } = require("../services/fcm");

// GET paginated list
exports.getNotifications = async (req, res) => {
  console.log("get notifications");
  console.log(req.user);
  const userId = req.user.userId;
  console.log({ userId });
  const filter = { receiverId: userId };

  const notifications = await Notification.find(filter).sort({ createdAt: -1 });

  res.json({ data: notifications });
};

// PATCH mark as read
exports.markAsRead = async (req, res) => {
  console.log("mark as read");
  const userId = req.user.userId;
  const { id } = req.params;
  const notif = await Notification.findOneAndUpdate(
    { _id: id, receiverId: userId },
    { read: true },
    { new: true }
  );
  console.log({ notif });
  if (!notif) return res.status(404).json({ message: "Not found" });
  res.json({ data: notif });
};

// DELETE notification
exports.deleteNotification = async (req, res) => {
  const userId = req.user.id;
  await Notification.deleteOne({ _id: req.params.id, receiverId: userId });
  res.json({ message: "Deleted" });
};

// resend all unsent notifications (e.g. after downtime)
exports.resendPendingNotifications = async (req, res) => {
  const unsent = await Notification.find({ sent: false });
  let count = 0;
  for (let n of unsent) {
    const tokenDoc = await DeviceToken.findOne({ userId: n.receiverId });
    if (tokenDoc?.token) {
      try {
        await sendNotification(
          tokenDoc.token,
          "You have a new notification",
          n.message,
          { notificationId: n._id.toString(), ...n.data }
        );
        n.sent = true;
        await n.save();
        count++;
      } catch (e) {
        /* log & continue */
      }
    }
  }
  res.json({ resent: count });
};

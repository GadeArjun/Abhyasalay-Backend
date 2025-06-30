const Notification = require("../models/Notification");
const DeviceToken = require("../models/DeviceToken");
const { sendNotification } = require("../services/fcm");

exports.sendAndSaveNotification = async ({
  receiverUserIds = [],
  senderUserId,
  type,
  title,
  body,
  data = {},
}) => {
  for (const receiverId of receiverUserIds) {
    try {
      // Save in MongoDB
      const notification = new Notification({
        receiverId,
        senderId: senderUserId,
        type,
        message: body,
        testId: data?.testId,
      });
      await notification.save();

      console.log("FCM notification sent successfully",receiverId)

      // Send push to FCM device
      const tokenDoc = await DeviceToken.findOne({ userId: receiverId });
      console.log("tokenDoc", tokenDoc)
      if (tokenDoc?.token) {
        await sendNotification(tokenDoc.token, title, body, {
          notificationId: notification._id.toString(),
          ...data,
        });
      }
    } catch (err) {
      console.error(`FCM notification failed for ${receiverId}:`, err.message);
    }
  }
};

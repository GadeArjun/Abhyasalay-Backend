const { Expo } = require("expo-server-sdk");
const expo = new Expo();

exports.sendNotification = async (expoPushToken, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
    return;
  }

  const messages = [
    {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    },
  ];

  try {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    console.log("✅ Notification sent to Expo push service");
  } catch (error) {
    console.error("❌ Failed to send push via Expo:", error);
  }
};

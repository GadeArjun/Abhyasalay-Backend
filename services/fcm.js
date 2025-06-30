const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const domain = process.env.DOMAIN;
const iconURL = `${domain}/public/Logo.png`;
console.log(iconURL);
// Send notification to Expo push service
exports.sendNotification = async (expoPushToken, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
    return;
  }

  const messages = [
    {
      to: expoPushToken,
      sound: "default",
      title: `अभ्यासालय - ${title}`,
      body,
      sound: "default", // sound here triggers channel’s custom sound
      channelId: "default", // crucial for Android sound/icon behavior
      data: {
        ...data,
        icon: iconURL, // Pass custom icon in `data`
      },
    },
  ];

  try {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo
        .sendPushNotificationsAsync(chunk)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => console.error(error));
    }
    console.log("✅ Notification sent to Expo push service");
  } catch (error) {
    console.error("❌ Failed to send push via Expo:", error);
  }
};

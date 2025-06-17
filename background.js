// Constants and Configurations
const APP_CONFIG = {
  title: "SALMI TAHAR AMATTI v2",
  iconUrl: "./assets/img/robot.gif",
};

// Installation and Update Handler
chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  const thisVersion = chrome.runtime.getManifest().version;
  const notificationConfig = {
    title: APP_CONFIG.title,
    iconUrl: APP_CONFIG.iconUrl,
    type: "basic",
  };

  if (reason === "install") {
    chrome.notifications.create("", {
      ...notificationConfig,
      message: "تم تثبيت الإضافة بنجاح",
    });
  } else if (reason === "update" && thisVersion !== previousVersion) {
    chrome.notifications.create("", {
      ...notificationConfig,
      message: `تحديث جديد، من: ${previousVersion} إلى: ${thisVersion}!`,
    });
  }
});

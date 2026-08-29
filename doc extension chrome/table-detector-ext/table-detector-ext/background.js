// background.js - Service Worker Manifest V3
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Table Selector Detective installé !");
});

// Réception des messages depuis popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ping") {
    sendResponse({ status: "ok" });
  }
  return true;
});

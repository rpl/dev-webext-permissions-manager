console.log("dev-webext-permissions-manager - background page loaded");

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({url: "/ui/tab.html"});
});

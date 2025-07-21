chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "define-word",
    title: "Define with Word Finder",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "define-word" && info.selectionText) {
    const selectedWord = info.selectionText.trim();

    chrome.tabs.create({
      url: `https://www.google.com/search?q=define+${encodeURIComponent(selectedWord)}`
    });
  }
});

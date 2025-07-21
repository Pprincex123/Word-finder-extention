// popup.js
document.addEventListener("DOMContentLoaded", () => {
  // Ask the content script for the selected text
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" }, (response) => {
      if (chrome.runtime.lastError || !response?.selectedText) {
        document.getElementById("word-title").textContent = "No word selected";
        document.getElementById("definition").textContent = "Please highlight a word before opening the extension.";
        return;
      }

      const word = response.selectedText.trim();
      document.getElementById("word-title").textContent = word;
      document.getElementById("definition").textContent = "Definition for \"" + word + "\" goes here...";
    });
  });
});

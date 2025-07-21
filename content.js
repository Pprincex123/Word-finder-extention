// This runs when the user selects a word on the page
document.addEventListener("mouseup", async function (event) {
  const selection = window.getSelection().toString().trim();

  // Remove any existing tooltip
  const existing = document.getElementById("word-define-tooltip");
  if (existing) existing.remove();

  if (selection && /^[a-zA-Z]+$/.test(selection)) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selection}`);
      if (!response.ok) throw new Error("Not found");
      const data = await response.json();
      const meaning = data[0]?.meanings[0]?.definitions[0]?.definition || "No definition found.";

      const tooltip = document.createElement("div");
      tooltip.id = "word-define-tooltip";
      tooltip.innerText = `${selection}: ${meaning}`;
      tooltip.style.position = "absolute";
      tooltip.style.top = `${event.pageY + 10}px`;
      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.background = "#fff";
      tooltip.style.border = "1px solid #ccc";
      tooltip.style.padding = "8px";
      tooltip.style.borderRadius = "8px";
      tooltip.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
      tooltip.style.zIndex = "9999";
      tooltip.style.maxWidth = "300px";
      tooltip.style.fontSize = "14px";

      document.body.appendChild(tooltip);

      setTimeout(() => tooltip.remove(), 10000);
    } catch {
      console.log("No definition found for:", selection);
    }
  }
});

// ✅ Add this so popup.js can request the selected text
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ selectedText });
  }
});

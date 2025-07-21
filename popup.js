document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" }, async (response) => {
      const word = response?.selectedText?.trim();

      if (!word) {
        document.getElementById("word-title").textContent = "No word selected";
        document.getElementById("definition").textContent = "Please highlight a word before opening the extension.";
        return;
      }

      document.getElementById("word-title").textContent = word;

      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();

        const meaningObj = data[0]?.meanings?.[0];
        const definition = meaningObj?.definitions?.[0]?.definition || "No definition found.";
        const example = meaningObj?.definitions?.[0]?.example || "No example available.";
        const pronunciation = data[0]?.phonetics?.[0]?.text || "/–/";

        // ✅ Collect synonyms from all definitions + meaning level
        let synonyms = [];

        if (meaningObj?.definitions?.length > 0) {
          meaningObj.definitions.forEach(def => {
            if (def.synonyms && def.synonyms.length > 0) {
              synonyms = [...synonyms, ...def.synonyms];
            }
          });
        }

        if (meaningObj?.synonyms?.length > 0) {
          synonyms = [...synonyms, ...meaningObj.synonyms];
        }

        // Remove duplicates
        synonyms = [...new Set(synonyms)];

        // ✅ Update DOM
        document.getElementById("definition").textContent = definition;
        document.getElementById("example").textContent = `"${example}"`;
        document.getElementById("pronunciation").textContent = pronunciation;

        const synonymsList = document.getElementById("synonyms");
        synonymsList.innerHTML = "";

        if (synonyms.length > 0) {
          synonyms.forEach(s => {
            const li = document.createElement("li");
            li.textContent = s;
            synonymsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No synonyms found.";
          synonymsList.appendChild(li);
        }
      } catch (err) {
        document.getElementById("definition").textContent = "Failed to fetch definition.";
      }
    });
  });
});

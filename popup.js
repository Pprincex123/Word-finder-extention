document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" }, async (response) => {
      const word = response?.selectedText?.trim();

      if (!word) {
        document.getElementById("word-title").textContent = "No word selected";
        document.getElementById("definition").textContent = "Please highlight a word before opening the extension.";
        return;
      }

      fetchDefinition(word);
    });
  });
});

function fetchDefinition(word) {
  document.getElementById("word-title").textContent = word;

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    })
    .then(data => {
      const meaningObj = data[0]?.meanings?.[0];
      const definition = meaningObj?.definitions?.[0]?.definition || "No definition found.";
      const example = meaningObj?.definitions?.[0]?.example || "No example available.";
      const synonyms = meaningObj?.definitions?.[0]?.synonyms || [];
      const pronunciation = data[0]?.phonetics?.[0]?.text || "/–/";
      const audioUrl = data[0]?.phonetics?.find(p => p.audio)?.audio;

      // --- Make definition clickable ---
      const definitionEl = document.getElementById("definition");
      const words = definition.split(" ").map(w => {
        return `<span class="clickable-word">${w}</span>`;
      });
      definitionEl.innerHTML = words.join(" ");

      // Example
      document.getElementById("example").textContent = `"${example}"`;

      // Pronunciation
      const pronunciationEl = document.getElementById("pronunciation");
      pronunciationEl.textContent = pronunciation + " ";
      pronunciationEl.innerHTML = pronunciation; // clear previous icons

      // 🔊 Speak
      const speakIcon = document.createElement("span");
      speakIcon.textContent = "🔊";
      speakIcon.title = "Speak";
      speakIcon.style.cursor = "pointer";
      speakIcon.style.marginLeft = "8px";
      speakIcon.onclick = () => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
      };
      pronunciationEl.appendChild(speakIcon);

      // 🎧 Audio if available
      if (audioUrl) {
        const listenIcon = document.createElement("span");
        listenIcon.textContent = "🎧";
        listenIcon.title = "Listen (recorded)";
        listenIcon.style.cursor = "pointer";
        listenIcon.style.marginLeft = "8px";
        listenIcon.onclick = () => {
          const audio = new Audio(audioUrl);
          audio.play();
        };
        pronunciationEl.appendChild(listenIcon);
      }

      // Synonyms
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

      // Enable word-click interaction
      addDefinitionWordListeners();

    })
    .catch(() => {
      document.getElementById("definition").textContent = "Failed to fetch definition.";
    });
}

// ✅ Adds click event to every word in the definition
function addDefinitionWordListeners() {
  const defContainer = document.getElementById("definition");
  defContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("clickable-word")) {
      const clickedWord = e.target.textContent.replace(/[.,;!?()]/g, "");
      if (confirm(`Do you want to see the definition of "${clickedWord}"?`)) {
        fetchDefinition(clickedWord);
      }
    }
  });
}

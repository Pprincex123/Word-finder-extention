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
        const synonyms = meaningObj?.definitions?.[0]?.synonyms || [];
        const pronunciation = data[0]?.phonetics?.[0]?.text || "/–/";
        const audioUrl = data[0]?.phonetics?.find(p => p.audio)?.audio;

        document.getElementById("definition").textContent = definition;
        document.getElementById("example").textContent = `"${example}"`;
        document.getElementById("pronunciation").textContent = pronunciation;

        // 🔊 Add voice button using browser speech synthesis
        const speakBtn = document.createElement("button");
        speakBtn.textContent = "🔊 Speak";
        speakBtn.onclick = () => {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.lang = "en-US";
          speechSynthesis.speak(utterance);
        };
        document.getElementById("pronunciation").appendChild(speakBtn);

        // 🔊 Add API audio playback if available
        if (audioUrl) {
          const listenBtn = document.createElement("button");
          listenBtn.textContent = "🎧 Listen";
          listenBtn.style.marginLeft = "8px";
          listenBtn.onclick = () => {
            const audio = new Audio(audioUrl);
            audio.play();
          };
          document.getElementById("pronunciation").appendChild(listenBtn);
        }

        // Synonyms list
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

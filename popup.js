document.addEventListener("DOMContentLoaded", () => {
  const word = "example";
  const definition = "A representative form or pattern.";
  const synonyms = ["sample", "instance", "illustration"];
  const exampleUsage = "This is an example of how to use the word.";
  const pronunciation = "/ɪɡˈzæmpəl/";

  document.getElementById("word-title").textContent = word;
  document.getElementById("definition").textContent = definition;
  document.getElementById("pronunciation").textContent = pronunciation;
  document.getElementById("example").textContent = exampleUsage;

  const synonymsList = document.getElementById("synonyms");
  synonymsList.innerHTML = "";
  synonyms.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    synonymsList.appendChild(li);
  });
});

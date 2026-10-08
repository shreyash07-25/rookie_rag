const form = document.getElementById("form");
const fileInput = document.getElementById("pdf");
const fileName = document.getElementById("file-name");
const questionInput = document.getElementById("question");
const submitBtn = document.getElementById("submit");
const resultBox = document.getElementById("result");
const answerEl = document.getElementById("answer");

// Show the chosen file name
fileInput.addEventListener("change", () => {
  fileName.textContent = fileInput.files[0]
    ? fileInput.files[0].name
    : "Choose a PDF file";
});

function showResult(text, isError = false) {
  answerEl.textContent = text;
  resultBox.classList.toggle("error", isError);
  resultBox.classList.remove("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  const question = questionInput.value.trim();
  if (!file || !question) return;

  const formData = new FormData();
  formData.append("pdf", file); // must match upload.single("pdf") in server.js
  formData.append("question", question);

  submitBtn.disabled = true;
  submitBtn.textContent = "Thinking...";
  showResult("Reading the PDF and finding an answer. The first question on a new PDF takes longer...");

  try {
    const res = await fetch("/upload-pdf", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    showResult(data.answer);
  } catch (err) {
    showResult(err.message, true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Get answer";
  }
});

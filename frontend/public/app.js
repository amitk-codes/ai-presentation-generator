// Same-origin webhook path — nginx reverse-proxies /webhook/* to n8n.
const WEBHOOK_URL = "/webhook/generate";

const form = document.getElementById("form");
const submitBtn = document.getElementById("submit");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const errorText = document.getElementById("error-text");
const result = document.getElementById("result");
const resultTitle = document.getElementById("result-title");
const dlPdf = document.getElementById("dl-pdf");
const dlPptx = document.getElementById("dl-pptx");
const preview = document.getElementById("preview");

function show(el) { el.hidden = false; }
function hide(el) { el.hidden = true; }

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const content = document.getElementById("content").value.trim();
  if (!content) return;

  const payload = {
    content,
    n_slides: Number(document.getElementById("n_slides").value) || 6,
    tone: document.getElementById("tone").value,
    audience: document.getElementById("audience").value.trim(),
    instructions: document.getElementById("instructions").value.trim(),
  };

  hide(errorBox);
  hide(result);
  show(loading);
  submitBtn.disabled = true;
  submitBtn.textContent = "Generating…";

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Server responded ${res.status}. ${detail.slice(0, 200)}`);
    }

    const data = await res.json();
    if (!data.files || !data.files.pdf) {
      throw new Error("The response did not include a downloadable file.");
    }

    resultTitle.textContent = data.title || "Your presentation";
    dlPdf.href = data.files.pdf;
    dlPptx.href = data.files.pptx || data.files.pdf;
    dlPptx.hidden = !data.files.pptx;
    preview.src = data.files.pdf;

    hide(loading);
    show(result);
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    hide(loading);
    errorText.textContent =
      "Generation failed. " + (err && err.message ? err.message : "Please try again.");
    show(errorBox);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Generate presentation";
  }
});

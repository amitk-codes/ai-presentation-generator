/**
 * Smoke test: runs the exact generation pipeline WITHOUT n8n.
 *   topic -> Gemini (structured deck JSON) -> render-service (PDF + PPTX)
 *
 * Usage (from the project root):
 *   docker compose up -d render-service   # or run it locally on :4000
 *   node --env-file=.env scripts/smoke-test.mjs "The future of remote work"
 *
 * It's both how we verify the Gemini key + prompt, and a way for a grader to
 * sanity-check their own key. The same prompt logic lives in the n8n workflow.
 */

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const RENDER_URL = process.env.RENDER_URL || "http://localhost:4000/render";

const topic = process.argv[2] || "Introduction to Machine Learning";
const nSlides = Number(process.argv[3] || 6);

if (!API_KEY || API_KEY.startsWith("your_")) {
  console.error("✗ GEMINI_API_KEY is missing. Run with: node --env-file=.env scripts/smoke-test.mjs");
  process.exit(1);
}

// ---- The deck schema Gemini must return (mirrors render-service/types.ts) ----
const DECK_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    slides: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["title", "content", "section", "closing"] },
          title: { type: "STRING" },
          subtitle: { type: "STRING" },
          bullets: { type: "ARRAY", items: { type: "STRING" } },
          notes: { type: "STRING" },
        },
        required: ["type", "title"],
      },
    },
  },
  required: ["title", "slides"],
};

const SYSTEM_PROMPT = `You are an expert presentation designer.
Produce a clear, well-structured slide deck as JSON.
Rules:
- Start with one "title" slide and end with one "closing" slide.
- Use "content" slides with 3-5 concise, parallel bullet points (max ~12 words each).
- Optionally use "section" slides to divide major parts.
- Add a brief "notes" (speaker note) to content slides.
- Keep titles short and specific. No markdown, no emojis.`;

function buildUserPrompt(topic, nSlides, opts = {}) {
  const lines = [
    `Create a presentation about: ${topic}`,
    `Target roughly ${nSlides} slides (including title and closing).`,
  ];
  if (opts.tone) lines.push(`Tone: ${opts.tone}.`);
  if (opts.audience) lines.push(`Audience: ${opts.audience}.`);
  if (opts.instructions) lines.push(`Extra instructions: ${opts.instructions}.`);
  return lines.join("\n");
}

async function callGemini(topic, nSlides) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: buildUserPrompt(topic, nSlides) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: DECK_SCHEMA,
      temperature: 0.7,
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${text.slice(0, 600)}`);
  }
  const data = JSON.parse(text);
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error(`No content in Gemini response: ${text.slice(0, 600)}`);
  // Defensive: strip accidental markdown fences before parsing.
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function render(deck) {
  const res = await fetch(RENDER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deck, formats: ["pdf", "pptx"] }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Render HTTP ${res.status}: ${text.slice(0, 600)}`);
  return JSON.parse(text);
}

(async () => {
  console.log(`→ Gemini (${MODEL}): generating a deck about "${topic}"...`);
  const deck = await callGemini(topic, nSlides);
  console.log(`✓ Gemini returned "${deck.title}" with ${deck.slides.length} slides`);
  console.log("  slide types:", deck.slides.map((s) => s.type).join(", "));

  console.log(`→ Render service (${RENDER_URL})...`);
  try {
    const out = await render(deck);
    console.log("✓ Rendered:");
    console.log("  PDF: ", out.files.pdf);
    console.log("  PPTX:", out.files.pptx);
  } catch (err) {
    console.log("⚠ Render step skipped/failed (is render-service running on :4000?)");
    console.log("  ", err.message);
    console.log("  Deck JSON preview:", JSON.stringify(deck, null, 2).slice(0, 500));
  }
})().catch((err) => {
  console.error("✗ Smoke test failed:", err.message);
  process.exit(1);
});

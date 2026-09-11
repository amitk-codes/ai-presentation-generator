# Architecture & Trade-offs

A short note on how this was built, why it's designed this way, and the trade-offs made
along the way.

## 1. Understanding the original (Presenton)

[Presenton](https://github.com/presenton/presenton) is a mature open-source AI slide
generator (FastAPI + Next.js). It has **two generation modes**:

- **Standard** — three LLM passes (outline → per-slide layout selection → per-slide
  content as schema-conforming JSON), then hydrates React template components and fetches
  images/icons.
- **Smart** — a single streamed LLM call emits the whole deck as self-contained HTML
  `<section>`s (1280×720, inline Chart.js), sanitized and validated.

Both modes **export the same way**: a headless Chromium renders a Next.js page and prints
it — and notably, that export package isn't even in the public repo. Presenton already
ships a REST API *and* an MCP server (auto-generated from its OpenAPI spec).

**Takeaway:** the "engine" already exists behind a clean HTTP seam, so the exercise is
really about *understanding the pipeline, redesigning it, and turning it into a usable
product* — not re-deriving slide generation from scratch.

## 2. The redesign

One **generation engine** with three thin interfaces:

```
Web app ─┐
         ├─► n8n workflow ─► render service ─► PDF + PPTX
MCP  ────┘   (the "brain")   (deck JSON → files)
```

- **n8n workflow** — the generation logic, as six visible nodes:
  `Webhook → Build prompt → Gemini → Parse deck → Render → Respond`. This is deliberately
  the *brain*, not a passthrough — the AI call and deck assembly are real workflow steps.
- **Render service** — a small Node/TypeScript service that turns **deck JSON** into a
  themed PDF (Playwright) and an editable PPTX (pptxgenjs).
- **Web app** and **MCP server** — thin clients that both trigger the *same* workflow, so
  there is no duplicated generation logic.

### The deck-JSON contract (single source of truth)

The AI returns a structured deck; both outputs are rendered from it:

```jsonc
{
  "title": "…",
  "theme": "professional",          // derived from the requested tone
  "slides": [
    { "type": "title",   "title": "…", "subtitle": "…", "image_query": "…" },
    { "type": "content", "title": "…", "bullets": ["…"], "image_query": "…" },
    { "type": "stat",    "title": "…", "stats": [{ "value": "70%", "label": "…" }] },
    { "type": "quote",   "quote": "…", "attribution": "…" },
    { "type": "section", "title": "…", "image_query": "…" },
    { "type": "closing", "title": "…", "subtitle": "…" }
  ]
}
```

## 3. Key decisions & trade-offs

**Reuse vs. rebuild → hybrid.** Presenton's own API/MCP could have been wrapped, but that
hides the "understand and rebuild" part. Instead I recreated its *Smart* insight (AI
drafts structured content → render to files) as my own pipeline, and do **not** run
Presenton at runtime. I deliberately did **not** rebuild its template-schema system or its
separate pixel-perfect PPTX renderer — high effort, low marginal value for this scope.

**Logic in n8n, not hidden in code.** The brief asks to "recreate the core workflow in
n8n." So the prompt building, AI call, and parsing are workflow nodes; only the mechanical
HTML→file rendering (which needs a headless browser) is delegated to the render service.

**Gemini `flash-lite` + thinking disabled.** The heavier `gemini-3.6-flash` has a tiny
free-tier cap (~20 requests/day) that caused throttling and multi-second retries. Switching
to `gemini-3.1-flash-lite` (500/day, 15/min) and setting `thinkingBudget: 0` cut a clean
generation from ~8s to ~4s and removed the throttle spikes — at zero cost.

**JSON mode without `responseSchema`.** `flash-lite` was intermittently unreliable with a
strict `responseSchema`, so the deck shape is specified in the prompt and validated
defensively after parsing (mirrors the reference approach). More robust for this model.

**One deck JSON → two renderers.** Structured JSON (not raw HTML) is the source of truth,
which yields a genuinely *editable* PPTX (native text boxes) as well as a controlled PDF.

**PDF vs. PPTX fonts.** The PDF (headless Chromium) uses the themed Google Font; the PPTX
uses a safe system fallback so PowerPoint doesn't substitute — colors match in both. The
PDF is the pixel-consistent artifact; the PPTX is the editable one.

**Themes, photos, layouts.** Each tone maps to a theme (fonts + palette). Photos come from
**Pexels** (`source.unsplash.com` is deprecated; Pexels has higher free limits and simpler
terms), fetched and embedded as base64 into both formats, used sparingly (cover/section/
split) with dark overlays — with graceful fallback to typography if the key or a fetch is
missing. The AI also varies layouts (stat / quote / split) so decks look designed, not
templated.

**Frontend: React + TS + Tailwind + Vite.** Started vanilla (appropriate for a single
form), then migrated to React + TypeScript and Tailwind to match the mainstream product
stack a reviewer expects — design preserved throughout. nginx serves the built bundle and
reverse-proxies `/webhook/*` and `/files/*`, keeping the browser (and pdf.js) same-origin,
so there's **no CORS** layer.

**MCP: remote Streamable HTTP, same workflow.** One server works with both ChatGPT and
Claude and holds no generation logic — it triggers the same n8n webhook. The tool call is
**synchronous** (waits ~5–7s, returns links), which is simpler and fits client timeouts;
Presenton's own MCP uses an async start-and-poll pattern for very long decks. For the demo
the MCP runs **open (no auth)** behind a tunnel; production would add a bearer token / OAuth.

## 4. Trade-offs, briefly

- **Photos add ~2–3s** (parallel Pexels fetches) and larger files — worth it for the visual
  jump; disabled cleanly by omitting the key.
- **Stock imagery** is used sparingly with overlays so it reads as designed, not clip-art.
- **Synchronous generation** is simple but caps at the client's tool/HTTP timeout; long
  decks would want the async job pattern.
- **AI content is illustrative** — the prompt forbids fabricating quotes from real people
  and treats stat numbers as estimates, not cited facts.

## 5. What I'd do next (production hardening)

- Async job queue + progress polling for long decks (mirrors Presenton's MCP pattern).
- API-key / OAuth auth on the workflow webhook and MCP server.
- Cache Pexels results and add rate-limit backoff.
- Automated tests around the render service and the deck-JSON contract.
- Pin the n8n image version and ship the workflow import as a startup step.

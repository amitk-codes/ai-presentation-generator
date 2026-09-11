# AI Presentation Generator

Turn a topic into a polished, downloadable slide deck — **PDF** and editable
**PowerPoint** — in a few seconds. Describe what you want, pick a tone, and the system
drafts a structured, on-brand presentation with photos and varied layouts.

Built by studying the open-source [Presenton](https://github.com/presenton/presenton)
project and **redesigning its core pipeline** into a lean, multi-interface product: the
generation logic lives in an **n8n** workflow, reachable two ways — a web app and an
**MCP server** callable from ChatGPT or Claude.

_Built by Amit Kumar · [GitHub](https://github.com/amitk-codes) · [LinkedIn](https://www.linkedin.com/in/amitkumar-aiml)_

> Design decisions and trade-offs are documented in **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Architecture

```
   ┌─────────────┐         ┌──────────────────┐
   │   Web app   │         │  ChatGPT / Claude │
   │  (React)    │         │   (via MCP)       │   ← two ways in
   └──────┬──────┘         └────────┬──────────┘
          │                         │
          └────────────┬────────────┘
                       ▼
             ┌───────────────────┐
             │   n8n workflow    │   ← the "brain": prompt → AI → deck JSON
             └─────────┬─────────┘
                       ▼
             ┌───────────────────┐
             │  Render service   │   ← deck JSON → themed PDF + PPTX
             └───────────────────┘
```

One generation engine (the n8n workflow); the web app and the MCP server are thin
clients that trigger the **same** workflow. A render service turns the AI's structured
deck JSON into downloadable files.

| Layer | Technology |
|---|---|
| AI model | Google Gemini (`gemini-3.1-flash-lite`) |
| Orchestration | n8n (self-hosted) |
| Render service | Node.js + TypeScript · Playwright (PDF) · pptxgenjs (PPTX) |
| Frontend | React + TypeScript · Vite · Tailwind CSS v4 · pdf.js |
| MCP server | Node.js + TypeScript · official MCP SDK (Streamable HTTP) |
| Packaging | Docker Compose |

## Features

- **Web app** — type a topic, pick tone / slide count / audience, preview the deck
  (pdf.js), and download PDF + PPTX.
- **MCP server** — generate decks from inside ChatGPT or Claude via a `generate_presentation` tool.
- **Per-tone themes** — professional, casual, academic, persuasive, inspirational — each
  with its own fonts and colors.
- **Photos** — relevant Pexels images on cover/section/split slides (optional; graceful
  fallback to clean typography).
- **Varied layouts** — title, content, section, big-stat, quote, and text+photo split.
- **Two formats** — a pixel-consistent PDF and a genuinely editable PowerPoint from one
  source of truth.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A free Google Gemini API key — [Google AI Studio](https://aistudio.google.com/apikey)
- _(optional)_ A free [Pexels API key](https://www.pexels.com/api/) for slide photos

## Quickstart

```bash
# 1. Configure your keys
cp .env.example .env
#    edit .env → add GEMINI_API_KEY (and optionally PEXELS_API_KEY)

# 2. Build and start everything (web + n8n + render + mcp)
docker compose up -d --build

# 3. Import and activate the n8n workflow (one-time)
docker cp workflows/presentation-generator.json pa-n8n:/tmp/wf.json
docker compose exec -T n8n n8n import:workflow --input=/tmp/wf.json
docker compose exec -T n8n n8n update:workflow --id=presgenwf0000001 --active=true
docker compose restart n8n

# 4. Open the web app
open http://localhost:8080
```

Ports: web `8080` · n8n `5678` · render `4000` · MCP `8787`.

## Using it

### 1. Web app
Open **http://localhost:8080**, enter a topic, choose options, and generate. Preview the
slides and download the PDF or PPTX.

### 2. REST (the workflow's webhook)
```bash
curl -X POST http://localhost:5678/webhook/generate \
  -H "Content-Type: application/json" \
  -d '{"content":"Getting started with Kubernetes","n_slides":6,"tone":"professional","audience":"developers"}'
# → { "title": "...", "files": { "pdf": "...", "pptx": "..." } }
```

### 3. MCP (ChatGPT / Claude)
The MCP server runs at `http://localhost:8787/mcp` and triggers the same workflow. Since
ChatGPT/Claude are cloud services, expose it with a tunnel:

```bash
cloudflared tunnel --url http://localhost:8787   # → https://<random>.trycloudflare.com
```

Add `https://<your-tunnel>/mcp` as a **custom connector** (no auth) in Claude
(Settings → Connectors) or ChatGPT (Settings → Connectors / Developer mode), then ask:
*"Generate a 6-slide professional deck about the future of AI."*

> Returned links point at `localhost:4000` (works on the machine running the stack). For
> a fully remote setup, tunnel the render service too and set `PUBLIC_BASE_URL`.

## Configuration

Set in `.env` (see `.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | yes | Google Gemini API key |
| `GEMINI_MODEL` | no | Model id (default `gemini-3.1-flash-lite`) |
| `PEXELS_API_KEY` | no | Slide photos; omit for typography-only decks |
| `PUBLIC_BASE_URL` | no | Base URL in download links (set to a tunnel for remote demos) |

## Project structure

```
.
├── docker-compose.yml          # web + n8n + render + mcp
├── workflows/                  # the n8n workflow (the generation pipeline)
├── render-service/             # deck JSON → PDF + PPTX (themes, photos, layouts)
├── frontend/                   # React + TS + Tailwind web app
├── mcp-server/                 # MCP server (calls the same workflow)
└── scripts/smoke-test.mjs      # test the pipeline without n8n
```

## Testing the pipeline without n8n

```bash
node --env-file=.env scripts/smoke-test.mjs "The future of remote work"
# THEME=persuasive node --env-file=.env scripts/smoke-test.mjs "Four-day work week"
```

## Credits

Built by **Amit Kumar** — [GitHub](https://github.com/amitk-codes) ·
[LinkedIn](https://www.linkedin.com/in/amitkumar-aiml). Inspired by
[Presenton](https://github.com/presenton/presenton).

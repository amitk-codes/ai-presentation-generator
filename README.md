# Presentation Automation

An AI presentation generator: give it a topic and instructions, and it produces a
downloadable slide deck (**PDF** and editable **PowerPoint**).

Built by studying the open-source [Presenton](https://github.com/presenton/presenton)
project, then **redesigning its core pipeline** into a lean, multi-interface product.
The slide-generation logic runs inside an **n8n** workflow, reachable two ways: a simple
web frontend, and an **MCP server** callable from ChatGPT or Claude.

## Architecture

```
   ┌─────────────┐         ┌─────────────┐
   │   Website   │         │ ChatGPT /   │
   │ (simple UI) │         │   Claude    │   ← two ways in
   └──────┬──────┘         └──────┬──────┘
          │                       │ (via MCP server)
          └───────────┬───────────┘
                      ▼
            ┌───────────────────┐
            │   n8n workflow    │   ← the brain: prompt → Gemini → deck data
            └─────────┬─────────┘
                      ▼
            ┌───────────────────┐
            │  Render service   │   ← deck data → PDF + PPTX (downloadable)
            └───────────────────┘
```

- **AI model:** Google Gemini (`gemini-3.1-flash-lite`)
- **Orchestration:** n8n (self-hosted)
- **Render service:** Node.js + TypeScript, Playwright (PDF) + pptxgenjs (PPTX)
- **Frontend:** React + TypeScript (Vite) + Tailwind CSS v4, pdf.js for the slide preview
- **MCP server:** Node.js + TypeScript, official MCP SDK (Streamable HTTP)
- **Packaging:** Docker Compose

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A free Google Gemini API key — [Google AI Studio](https://aistudio.google.com/apikey)

## Quickstart (work in progress)

```bash
# 1. Configure your key
cp .env.example .env
#    then edit .env and paste your GEMINI_API_KEY

# 2. Start the stack (currently: n8n)
docker compose up

# 3. Open n8n
#    http://localhost:5678
```

> This project is being built milestone by milestone. Setup steps for the render
> service, frontend, and MCP server are added as those pieces land.

## Render service

A standalone Node/TypeScript service that turns **deck JSON** into a **PDF** (via
Playwright) and an editable **PPTX** (via pptxgenjs). Try it directly:

```bash
docker compose up --build render-service
```

```bash
curl -X POST http://localhost:4000/render \
  -H "Content-Type: application/json" \
  -d '{
    "deck": {
      "title": "Introduction to Machine Learning",
      "slides": [
        { "type": "title", "title": "Introduction to Machine Learning", "subtitle": "A gentle overview" },
        { "type": "content", "title": "What is ML?", "bullets": ["Learns patterns from data", "Improves without explicit rules", "Powers vision, language, recommendations"], "notes": "Open with a relatable example." },
        { "type": "closing", "title": "Thank you", "subtitle": "Questions?" }
      ]
    }
  }'
```

The response contains `files.pdf` and `files.pptx` download URLs.

## n8n workflow (the generation pipeline)

The core logic lives in `workflows/presentation-generator.json` as six visible nodes:

```
Webhook → Build Gemini Request → Gemini → Parse Deck → Render → Respond
```

A topic goes in, Gemini returns structured deck JSON (forced via a response schema),
the render service turns it into files, and the webhook returns the download URLs.

**Run it:**

```bash
cp .env.example .env        # add your GEMINI_API_KEY
docker compose up -d --build

# Import + activate the workflow (one-time)
docker cp workflows/presentation-generator.json pa-n8n:/tmp/wf.json
docker compose exec -T n8n n8n import:workflow --input=/tmp/wf.json
docker compose exec -T n8n n8n update:workflow --id=presgenwf0000001 --active=true
docker compose restart n8n
```

You can also import it from the n8n UI (http://localhost:5678 → Import from File).

**Generate a deck:**

```bash
curl -X POST http://localhost:5678/webhook/generate \
  -H "Content-Type: application/json" \
  -d '{"content":"Getting started with Kubernetes","n_slides":6,"tone":"professional","audience":"developers"}'
# → { "title": "...", "files": { "pdf": "...", "pptx": "..." } }
```

Prefer to test the logic without n8n? `node --env-file=.env scripts/smoke-test.mjs "Your topic"`.

## Frontend

A **React + TypeScript** single-page app (Vite, styled with **Tailwind CSS v4**) to
drive the whole thing — open
**http://localhost:8080** after `docker compose up`. Type a topic, pick tone / slide
count / audience, and download the deck. The result shows a live **pdf.js** preview
with clickable slide thumbnails.

- **Design:** brand-aligned (Space Grotesk + Playfair Display, electric-yellow accent,
  sharp corners, hard shadows), with hover/entrance micro-interactions.
- **No CORS:** nginx serves the built bundle and reverse-proxies `/webhook/*` (to n8n)
  and `/files/*` (to the render service), so the browser — and pdf.js — stay same-origin.
- **Build:** a multi-stage Dockerfile runs `vite build`, then nginx serves the static
  bundle. Files: `frontend/src/` (components) + `frontend/nginx.conf` + `frontend/Dockerfile`.

For active frontend development with hot-reload: `cd frontend && npm install && npm run dev`
(Vite proxies `/webhook` and `/files` to the running containers).

## MCP server (ChatGPT / Claude)

A remote **MCP server** (Streamable HTTP) exposes one tool, `generate_presentation`,
that triggers the **same n8n workflow**. It runs at `http://localhost:8787/mcp` and
holds no generation logic of its own. Files: `mcp-server/`.

**Expose it publicly** (ChatGPT/Claude are cloud services and need a public URL):

```bash
# no signup required
cloudflared tunnel --url http://localhost:8787
# → gives a https://<random>.trycloudflare.com URL
```

**Connect it:**

- **Claude** (claude.ai → Settings → Connectors → Add custom connector) or Claude
  Desktop: use `https://<your-tunnel>/mcp`, no authentication.
- **ChatGPT** (Settings → Connectors / Developer mode → Add): same
  `https://<your-tunnel>/mcp` URL, no authentication.

Then ask: *"Generate a 6-slide professional deck about the future of AI."* The
assistant calls the tool and returns PDF + PPTX download links.

> The returned links point at `localhost:4000`, which works when you click them on
> the same machine running the stack. For a fully remote setup, also tunnel the
> render service and set `PUBLIC_BASE_URL` to that public URL.

## Status

- [x] Scaffold + n8n
- [x] Render service (PDF + PPTX)
- [x] n8n generation workflow
- [x] Frontend
- [x] MCP server
- [ ] Docs + demo

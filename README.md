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

- **AI model:** Google Gemini (`gemini-2.5-flash`)
- **Orchestration:** n8n (self-hosted)
- **Render service:** Node.js + TypeScript, Playwright (PDF) + pptxgenjs (PPTX)
- **Frontend:** plain HTML/CSS/JS
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

## Status

- [x] Scaffold + n8n
- [x] Render service (PDF + PPTX)
- [ ] n8n generation workflow
- [ ] Frontend
- [ ] MCP server
- [ ] Docs + demo

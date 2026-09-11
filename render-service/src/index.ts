import crypto from "crypto";
import fs from "fs";
import path from "path";
import express from "express";
import { DeckSchema } from "./types";
import { deckToHtml } from "./html-template";
import { renderPdf } from "./pdf";
import { renderPptx } from "./pptx";
import { resolveImages } from "./pexels";

const PORT = Number(process.env.PORT || 4000);
const PUBLIC_BASE_URL = (
  process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`
).replace(/\/$/, "");
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), "output");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const app = express();
app.use(express.json({ limit: "5mb" }));

// Health check (used by Docker + sanity tests).
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Serve generated files so the browser and MCP client can download them.
app.use("/files", express.static(OUTPUT_DIR));

// Core: deck JSON -> PDF + PPTX, return download URLs.
app.post("/render", async (req, res) => {
  const parsed = DeckSchema.safeParse(req.body?.deck);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid deck", details: parsed.error.flatten() });
  }
  const deck = parsed.data;

  const requested: string[] =
    Array.isArray(req.body?.formats) && req.body.formats.length
      ? req.body.formats
      : ["pdf", "pptx"];

  const id = crypto.randomUUID().slice(0, 8);
  try {
    // Fetch + embed Pexels photos for any slide with an image_query (best-effort).
    await resolveImages(deck);

    const files: Record<string, string> = {};

    if (requested.includes("pdf")) {
      const out = path.join(OUTPUT_DIR, `${id}.pdf`);
      await renderPdf(deckToHtml(deck), out);
      files.pdf = `${PUBLIC_BASE_URL}/files/${id}.pdf`;
    }
    if (requested.includes("pptx")) {
      const out = path.join(OUTPUT_DIR, `${id}.pptx`);
      await renderPptx(deck, out);
      files.pptx = `${PUBLIC_BASE_URL}/files/${id}.pptx`;
    }

    res.json({ id, title: deck.title, slides: deck.slides.length, files });
  } catch (err) {
    console.error("[render] failed:", err);
    res
      .status(500)
      .json({ error: "Render failed", message: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(
    `[render-service] listening on :${PORT} | output=${OUTPUT_DIR} | base=${PUBLIC_BASE_URL}`
  );
});

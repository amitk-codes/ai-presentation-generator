import { z } from "zod";

/**
 * The "deck JSON" contract — the single source of truth that both the PDF and
 * the PPTX are rendered from. The n8n workflow (and, through it, the frontend
 * and MCP server) produces exactly this shape.
 */
export const SlideSchema = z.object({
  type: z.enum(["title", "content", "section", "closing"]).default("content"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const DeckSchema = z.object({
  title: z.string().min(1),
  slides: z.array(SlideSchema).min(1),
});

export type Slide = z.infer<typeof SlideSchema>;
export type Deck = z.infer<typeof DeckSchema>;

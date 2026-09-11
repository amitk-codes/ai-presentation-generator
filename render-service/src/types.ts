import { z } from "zod";

/**
 * The "deck JSON" contract — the single source of truth that both the PDF and
 * the PPTX are rendered from. Produced by the n8n workflow (and, through it,
 * the frontend and MCP server).
 */
export const StatSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const SlideSchema = z.object({
  type: z
    .enum(["title", "content", "section", "closing", "stat", "quote"])
    .default("content"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  stats: z.array(StatSchema).optional(), // for "stat" slides
  quote: z.string().optional(), // for "quote" slides
  attribution: z.string().optional(),
  image_query: z.string().optional(), // Pexels search term (cover/section/content)
  notes: z.string().optional(),
  // Filled in at render time by resolveImages(); never sent by the client.
  imageData: z.string().optional(),
});

export const DeckSchema = z.object({
  title: z.string().min(1),
  theme: z.string().optional(), // tone-derived theme name (default: professional)
  slides: z.array(SlideSchema).min(1),
});

export type Slide = z.infer<typeof SlideSchema>;
export type Deck = z.infer<typeof DeckSchema>;

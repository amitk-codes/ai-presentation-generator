export interface GeneratePayload {
  content: string;
  n_slides: number;
  tone: string;
  audience?: string;
  instructions?: string;
}

export interface GenerateResponse {
  id?: string;
  title: string;
  files: { pdf: string; pptx?: string };
}

export type Status = "idle" | "loading" | "error" | "done";

export const TONES = [
  "professional",
  "casual",
  "persuasive",
  "academic",
  "inspirational",
] as const;

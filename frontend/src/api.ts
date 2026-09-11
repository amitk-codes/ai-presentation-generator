import type { GeneratePayload, GenerateResponse } from "./types";

// nginx (Docker) / Vite dev proxy forwards this to the n8n webhook.
const WEBHOOK_URL = "/webhook/generate";

export async function generatePresentation(
  payload: GeneratePayload
): Promise<GenerateResponse> {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Server responded ${res.status}. ${detail.slice(0, 160)}`);
  }
  const data = (await res.json()) as GenerateResponse;
  if (!data?.files?.pdf) throw new Error("No downloadable file was returned.");
  return data;
}

/** Absolute backend URL -> same-origin path (nginx proxies /files/*). */
export function toLocal(u: string): string {
  try {
    return new URL(u, location.origin).pathname;
  } catch {
    return u;
  }
}

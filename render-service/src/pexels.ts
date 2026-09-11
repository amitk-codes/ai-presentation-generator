import { Deck } from "./types";

const KEY = process.env.PEXELS_API_KEY;
const cache = new Map<string, string | null>();

/** Search Pexels for a query and return the top photo as a base64 data URI. */
export async function fetchImageDataUri(query: string): Promise<string | null> {
  if (!KEY || !query.trim()) return null;
  const key = query.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  try {
    const searchUrl =
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
      `&per_page=1&orientation=landscape`;
    const res = await fetch(searchUrl, { headers: { Authorization: KEY } });
    if (!res.ok) return cacheNull(key);

    const data: any = await res.json();
    const photo = data?.photos?.[0]?.src;
    const url = photo?.large2x || photo?.large || photo?.landscape;
    if (!url) return cacheNull(key);

    const imgRes = await fetch(url);
    if (!imgRes.ok) return cacheNull(key);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    const uri = `data:${ct};base64,${buf.toString("base64")}`;
    cache.set(key, uri);
    return uri;
  } catch {
    return cacheNull(key);
  }
}

function cacheNull(key: string): null {
  cache.set(key, null);
  return null;
}

/** Fill each image-bearing slide with its base64 image (in place, in parallel). */
export async function resolveImages(deck: Deck): Promise<void> {
  const targets = deck.slides.filter((s) => s.image_query);
  await Promise.all(
    targets.map(async (s) => {
      s.imageData = (await fetchImageDataUri(s.image_query!)) || undefined;
    })
  );
}

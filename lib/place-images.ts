/**
 * Place → photo lookup.
 * 1. Curated Unsplash photos for places Safar sells (instant, reliable).
 * 2. Wikipedia/Wikimedia lookup by place name, so any destination (including
 *    ones the AI planner invents) gets a photo that matches its name.
 * 3. A neutral landscape fallback.
 */
const UA = "SafarTravelPlatform/1.0 (travel planner)";
const WEEK = 60 * 60 * 24 * 7;

const unsplash = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const CURATED: { keys: string[]; id: string }[] = [
  { keys: ["hunza", "karimabad", "altit", "baltit", "attabad"], id: "1506905925346-21bda4d32df4" },
  { keys: ["skardu", "shangrila", "deosai", "shigar"], id: "1519681393784-d120267933ba" },
  { keys: ["swat", "kalam", "malam jabba", "mingora"], id: "1472396961693-142e6e269027" },
  { keys: ["madinah", "medina"], id: "1591604129939-f1efa4d9f7fa" },
  { keys: ["makkah", "mecca", "umrah", "hajj", "kaaba", "saudi"], id: "1564769625905-50e93615e769" },
  { keys: ["istanbul", "turkey", "türkiye", "turkiye"], id: "1524231757912-21f4fe3a7200" },
  { keys: ["maldives"], id: "1514282401047-d79a71a590e8" },
  { keys: ["dubai", "emirates", "uae"], id: "1512453979798-5ea266f8880c" },
  { keys: ["kuala lumpur", "malaysia"], id: "1596422846543-75c6fc197f07" },
  { keys: ["bangkok", "thailand"], id: "1508009603885-50cf7c579365" },
  { keys: ["baku", "azerbaijan"], id: "1565008576549-57569a49371d" },
];

export const GENERIC_MOUNTAINS = (w = 1600) => unsplash("1464822759023-fed622ff2c3b", w);
export const GENERIC_WORLD = (w = 1600) => unsplash("1469474968028-56623f02e42e", w);

/** Synchronous, no network. Returns null when no curated photo matches. */
export function curatedImage(name: string, width = 1400): string | null {
  const key = name.toLowerCase();
  const hit = CURATED.find((entry) => entry.keys.some((k) => key.includes(k)));
  return hit ? unsplash(hit.id, width) : null;
}

type WikiPage = { index?: number; thumbnail?: { source?: string } };

async function wikiSearchImage(query: string, width: number): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "query", generator: "search", gsrsearch: query, gsrlimit: "4",
      prop: "pageimages", piprop: "thumbnail", pithumbsize: String(width),
      format: "json", formatversion: "2", origin: "*",
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": UA },
      next: { revalidate: WEEK },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { query?: { pages?: WikiPage[] } };
    const pages = [...(json.query?.pages ?? [])].sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
    return pages.find((p) => p.thumbnail?.source)?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

/** Exact Wikipedia article (e.g. from an OpenStreetMap `wikipedia=en:Baltit Fort` tag). */
export async function wikiArticleImage(tag: string, width = 800): Promise<string | null> {
  try {
    const title = tag.replace(/^[a-z-]+:/i, "").trim();
    if (!title) return null;
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`,
      { headers: { "User-Agent": UA }, next: { revalidate: WEEK }, signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { thumbnail?: { source?: string } };
    const src = json.thumbnail?.source;
    return src ? src.replace(/\/\d+px-/, `/${width}px-`) : null;
  } catch {
    return null;
  }
}

/** Best photo for a place name. Never throws. */
export async function getPlaceImage(name: string, width = 1600): Promise<string> {
  const curated = curatedImage(name, width);
  if (curated) return curated;
  const full = name.trim();
  const first = full.split(",")[0]?.trim();
  const wiki =
    (await wikiSearchImage(`${full} travel destination`, width)) ??
    (first && first !== full ? await wikiSearchImage(first, width) : null);
  return wiki ?? GENERIC_WORLD(width);
}

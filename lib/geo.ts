/**
 * Free map data (no API keys): Nominatim geocoding + Overpass (OpenStreetMap)
 * for nearby hotels, restaurants and attractions. Never throws.
 */
const UA = "SafarTravelPlatform/1.0 (travel planner)";

export type PlaceKind = "hotel" | "restaurant" | "attraction";

export type MapPlace = {
  id: string;
  name: string;
  kind: PlaceKind;
  lat: number;
  lon: number;
  distanceKm: number;
  detail?: string;
  website?: string;
  wikipedia?: string;
};

export type TripMapData = {
  center: { lat: number; lon: number; label: string };
  radiusKm: number;
  places: MapPlace[];
};

const LIMITS: Record<PlaceKind, number> = { hotel: 12, restaurant: 12, attraction: 10 };

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

async function nominatim(q: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "en" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    const row = rows[0];
    if (!row) return null;
    return { lat: Number(row.lat), lon: Number(row.lon), label: row.display_name.split(",").slice(0, 2).join(",").trim() };
  } catch {
    return null;
  }
}

export async function geocode(destination: string) {
  const full = destination.trim();
  const first = full.split(",")[0]?.trim();
  return (await nominatim(full)) ?? (first && first !== full ? await nominatim(first) : null);
}

type OsmElement = {
  type: string; id: number; lat?: number; lon?: number;
  center?: { lat: number; lon: number }; tags?: Record<string, string>;
};

const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

async function overpass(lat: number, lon: number, radiusM: number): Promise<OsmElement[]> {
  const around = `(around:${radiusM},${lat},${lon})`;
  const query = `[out:json][timeout:25];(
    nwr["tourism"~"^(hotel|guest_house|hostel|motel|resort)$"]["name"]${around};
    nwr["amenity"~"^(restaurant|cafe)$"]["name"]${around};
    nwr["tourism"~"^(attraction|viewpoint|museum)$"]["name"]${around};
    nwr["historic"~"^(fort|castle|monument|archaeological_site)$"]["name"]${around};
  );out center tags 300;`;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { elements?: OsmElement[] };
      return json.elements ?? [];
    } catch {
      // try the next mirror
    }
  }
  return [];
}

function classify(tags: Record<string, string>): { kind: PlaceKind; detail?: string } | null {
  const tourism = tags.tourism;
  if (tourism && ["hotel", "guest_house", "hostel", "motel", "resort"].includes(tourism)) {
    const label = tourism.replace("_", " ");
    const stars = tags.stars ? ` · ${tags.stars}★` : "";
    return { kind: "hotel", detail: label.charAt(0).toUpperCase() + label.slice(1) + stars };
  }
  if (tags.amenity === "restaurant" || tags.amenity === "cafe") {
    const cuisine = tags.cuisine?.split(";").slice(0, 2).map((c) => c.replace(/_/g, " ")).join(", ");
    return { kind: "restaurant", detail: cuisine || (tags.amenity === "cafe" ? "Cafe" : "Restaurant") };
  }
  if (tourism || tags.historic) {
    const label = (tags.historic ?? tourism ?? "attraction").replace(/_/g, " ");
    return { kind: "attraction", detail: label.charAt(0).toUpperCase() + label.slice(1) };
  }
  return null;
}

export async function buildTripMap(destination: string): Promise<TripMapData | null> {
  try {
    const center = await geocode(destination);
    if (!center) return null;

    let radiusKm = 6;
    let elements = await overpass(center.lat, center.lon, radiusKm * 1000);
    const stays = (els: OsmElement[]) =>
      els.filter((e) => e.tags?.tourism === "hotel" || e.tags?.amenity === "restaurant").length;
    if (stays(elements) < 6) {
      radiusKm = 20;
      elements = await overpass(center.lat, center.lon, radiusKm * 1000);
    }

    const seen = new Set<string>();
    const all: MapPlace[] = [];
    for (const el of elements) {
      const tags = el.tags;
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (!tags?.name || lat === undefined || lon === undefined) continue;
      const cls = classify(tags);
      if (!cls) continue;
      const dedupe = `${cls.kind}:${tags.name.toLowerCase()}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      const website = tags.website ?? tags["contact:website"];
      all.push({
        id: `${el.type}${el.id}`, name: tags.name.slice(0, 120), kind: cls.kind, lat, lon,
        distanceKm: Math.round(haversineKm(center.lat, center.lon, lat, lon) * 10) / 10,
        detail: cls.detail,
        website: website && /^https?:\/\//.test(website) ? website : undefined,
        wikipedia: tags.wikipedia,
      });
    }

    const places = (Object.keys(LIMITS) as PlaceKind[]).flatMap((kind) =>
      all
        .filter((p) => p.kind === kind)
        // Well-documented places first, then nearest.
        .sort((a, b) => Number(!!b.wikipedia || !!b.website) - Number(!!a.wikipedia || !!a.website) || a.distanceKm - b.distanceKm)
        .slice(0, LIMITS[kind])
        .sort((a, b) => a.distanceKm - b.distanceKm),
    );
    return { center, radiusKm, places };
  } catch {
    return null;
  }
}

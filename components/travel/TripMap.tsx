"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { ExternalLink } from "lucide-react";
import type { MapPlace, PlaceKind, TripMapData } from "@/lib/geo";

const KINDS: { id: PlaceKind | "all"; label: string; color: string; icon: string }[] = [
  { id: "all", label: "All", color: "#14201a", icon: "" },
  { id: "hotel", label: "Hotels", color: "#2563eb", icon: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M3 18v2m18-2v2M7 9V7h4v2"/>' },
  { id: "restaurant", label: "Restaurants", color: "#ea580c", icon: '<path d="M6 3v7a2 2 0 0 0 2 2v9M10 3v7M8 3v7M17 21V3c-2 1-3 4-3 8h3"/>' },
  { id: "attraction", label: "Places to see", color: "#15803d", icon: '<path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>' },
];
const meta = (k: PlaceKind) => KINDS.find((x) => x.id === k)!;
const mapsLink = (p: { lat: number; lon: number }) => `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`;

function pinHtml(color: string, icon: string, active = false) {
  return `<div class="safar-pin ${active ? "safar-pin-active" : ""}" style="background:${color}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></div>`;
}

export default function TripMap({ data }: { data: TripMapData }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markers = useRef<Map<string, Marker>>(new Map());
  const [filter, setFilter] = useState<PlaceKind | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const visible = useMemo(
    () => data.places.filter((p) => filter === "all" || p.kind === filter),
    [data.places, filter],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.places.length };
    for (const p of data.places) c[p.kind] = (c[p.kind] ?? 0) + 1;
    return c;
  }, [data.places]);

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    const markerStore = markers.current;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !container.current || mapRef.current) return;
      const map = L.map(container.current, { scrollWheelZoom: false }).setView([data.center.lat, data.center.lon], 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      L.marker([data.center.lat, data.center.lon], {
        icon: L.divIcon({
          className: "",
          html: pinHtml("#14201a", '<circle cx="12" cy="12" r="4"/>'),
          iconSize: [30, 30], iconAnchor: [15, 30],
        }),
        zIndexOffset: 1000,
      }).addTo(map).bindTooltip(data.center.label, { direction: "top", offset: [0, -28] });
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerStore.clear();
    };
  }, [data.center]);

  // Draw markers whenever the filter changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;
      markers.current.forEach((m) => m.remove());
      markers.current.clear();
      for (const p of visible) {
        const k = meta(p.kind);
        const marker = L.marker([p.lat, p.lon], {
          icon: L.divIcon({ className: "", html: pinHtml(k.color, k.icon), iconSize: [30, 30], iconAnchor: [15, 30] }),
        }).addTo(map);
        const el = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = p.name;
        const sub = document.createElement("div");
        sub.textContent = [p.detail, `${p.distanceKm} km from centre`].filter(Boolean).join(" · ");
        sub.style.cssText = "font-size:12px;opacity:.75;margin:2px 0 6px";
        const link = document.createElement("a");
        link.href = mapsLink(p);
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "Open in Google Maps";
        link.style.cssText = "font-size:12px;font-weight:600;color:#176b4a";
        el.append(title, sub, link);
        marker.bindPopup(el);
        marker.on("click", () => setSelected(p.id));
        markers.current.set(p.id, marker);
      }
      const points: [number, number][] = [[data.center.lat, data.center.lon], ...visible.map((p) => [p.lat, p.lon] as [number, number])];
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    })();
    return () => { cancelled = true; };
  }, [visible, ready, data.center]);

  function choose(p: MapPlace) {
    setSelected(p.id);
    const m = markers.current.get(p.id);
    mapRef.current?.flyTo([p.lat, p.lon], Math.max(mapRef.current.getZoom(), 15), { duration: 0.6 });
    m?.openPopup();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter map places">
        {KINDS.map((k) => (
          <button
            key={k.id}
            role="tab"
            aria-selected={filter === k.id}
            onClick={() => { setFilter(k.id); setSelected(null); }}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              filter === k.id ? "border-accent bg-accent text-white" : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {k.label}
            <span className={`text-xs ${filter === k.id ? "text-white/80" : "text-muted"}`}>{counts[k.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-[1fr_22rem]">
        <div ref={container} className="h-[22rem] w-full lg:h-[32rem]" aria-label={`Map of ${data.center.label}`} />
        <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto border-t border-line lg:max-h-[32rem] lg:border-l lg:border-t-0">
          {visible.length === 0 && <li className="p-5 text-sm text-muted">No places of this type were found nearby.</li>}
          {visible.map((p) => {
            const k = meta(p.kind);
            return (
              <li key={p.id}>
                <button
                  onClick={() => choose(p)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-surface-2 ${selected === p.id ? "bg-accent-soft" : ""}`}
                >
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: k.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {[p.detail, `${p.distanceKm} km`].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <a
                    href={p.website ?? mapsLink(p)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${p.name}`}
                    className="mt-0.5 text-muted hover:text-accent"
                  >
                    <ExternalLink size={14} />
                  </a>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Within about {data.radiusKm} km of {data.center.label}. Place data from OpenStreetMap contributors; it may be incomplete,
        so check opening hours, prices and availability directly with each venue.
      </p>
    </div>
  );
}

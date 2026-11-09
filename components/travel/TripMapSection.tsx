import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildTripMap, type TripMapData } from "@/lib/geo";
import { wikiArticleImage } from "@/lib/place-images";
import { Photo } from "@/components/ui/Photo";
import TripMap from "./TripMap";

type Props = { tripId?: string; destination: string; existing?: TripMapData | null };

/** Map + highlights for a destination. Computes (and caches on the trip) if missing. */
export async function TripMapSection({ tripId, destination, existing }: Props) {
  let data = existing ?? null;

  if (!data) {
    data = await buildTripMap(destination);
    if (data && tripId) {
      try {
        const trip = await prisma.tripPlan.findUnique({ where: { id: tripId }, select: { itinerary: true } });
        if (trip && trip.itinerary && typeof trip.itinerary === "object" && !Array.isArray(trip.itinerary)) {
          await prisma.tripPlan.update({
            where: { id: tripId },
            data: { itinerary: { ...(trip.itinerary as object), mapData: data } as never },
          });
        }
      } catch {
        // Caching is best-effort.
      }
    }
  }

  if (!data) {
    return (
      <div className="card flex items-start gap-3 p-6 text-sm text-muted">
        <MapPin size={18} className="mt-0.5 shrink-0" />
        <p>
          We couldn&apos;t load the map for this place right now.{" "}
          <a className="font-semibold text-accent underline underline-offset-4" target="_blank" rel="noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`}>
            Open it in Google Maps
          </a>
          .
        </p>
      </div>
    );
  }

  const highlights = await Promise.all(
    data.places
      .filter((p) => p.kind === "attraction" && p.wikipedia)
      .slice(0, 4)
      .map(async (p) => ({ place: p, image: await wikiArticleImage(p.wikipedia!, 700) })),
  );
  const withImages = highlights.filter((h) => h.image);

  return (
    <div className="space-y-8">
      {withImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {withImages.map(({ place, image }) => (
            <figure key={place.id} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-2">
              <Photo src={image} alt={place.name} className="h-full w-full" />
              <div className="img-scrim absolute inset-0" />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-sm font-semibold leading-tight">{place.name}</p>
                <p className="mt-0.5 text-xs text-white/75">{place.detail}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <TripMap data={data} />
    </div>
  );
}

export function TripMapSkeleton() {
  return <div className="skeleton h-[32rem] w-full" aria-label="Loading map" />;
}

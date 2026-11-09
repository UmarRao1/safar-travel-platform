
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowRight,
  Globe2,
  MapPin,
  Mountain,
  MoonStar,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPlaceImage } from "@/lib/place-images";
import { Photo } from "@/components/ui/Photo";

export const metadata = {
  title: "Destination Catalogue | Safar",
  description:
    "Browse domestic, international and pilgrimage travel ideas from Safar.",
};

function tripTypeLabel(types: string[]) {
  if (types.includes("HAJJ_UMRAH")) return "Hajj & Umrah";
  if (types.includes("INTERNATIONAL")) return "International";
  return "Pakistan tours";
}

function tripTypeIcon(types: string[]) {
  if (types.includes("HAJJ_UMRAH")) return MoonStar;
  if (types.includes("INTERNATIONAL")) return Globe2;
  return Mountain;
}

function DestinationsLoading() {
  return (
    <main className="container-page py-16">
      <div className="skeleton h-10 w-72" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-80" />)}
      </div>
    </main>
  );
}

async function DestinationsContent() {
  // Load database-dependent content at request time.
  await connection();

  const destinations = await prisma.destination.findMany({
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { title: "asc" },
        select: {
          slug: true,
          title: true,
          tripType: true,
          durationDays: true,
          estimatedPrice: true,
          currency: true,
        },
      },
    },
  });

  const photos = await Promise.all(
    destinations.map((d) => (d.imageUrl ? Promise.resolve(d.imageUrl) : getPlaceImage(`${d.name} ${d.country}`, 1000))),
  );

  return (
    <main>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-14 sm:py-20">
          <h1 className="max-w-2xl text-4xl font-semibold sm:text-5xl">Explore destinations</h1>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            Browse destination ideas and enquiry-based packages. Prices and availability are confirmed after your requirements are reviewed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/international" className="btn btn-secondary btn-sm"><Globe2 size={15} /> International</Link>
            <Link href="/hajj-umrah" className="btn btn-secondary btn-sm"><MoonStar size={15} /> Hajj &amp; Umrah</Link>
            <Link href="/plan-trip" className="btn btn-primary btn-sm">Plan with AI <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <div className="container-page py-12 sm:py-16">
        {destinations.length === 0 ? (
          <div className="card p-6">
            <h2 className="font-semibold">The catalogue has not been seeded yet</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Run <code className="break-all">node --env-file=.env --import tsx ./prisma/seed-safar-catalogue.ts</code> from the project root, then refresh.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination, index) => {
              const types = [...new Set(destination.packages.map((pkg) => pkg.tripType))];
              const Icon = tripTypeIcon(types);
              return (
                <article key={destination.id} className="card flex flex-col overflow-hidden">
                  <Link href={`/destinations/${destination.slug}`} className="group relative block h-56 overflow-hidden bg-surface-2" aria-label={`Explore ${destination.name}`}>
                    <Photo src={photos[index]} alt={`${destination.name}, ${destination.country}`} className="h-full w-full transition duration-700 group-hover:scale-105" />
                    <div className="img-scrim absolute inset-0" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#14201a]">
                      <Icon size={13} /> {tripTypeLabel(types)}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="flex items-center gap-1.5 text-xs text-white/80"><MapPin size={13} /> {destination.country}</p>
                      <h2 className="mt-1 text-2xl font-semibold">{destination.name}</h2>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="line-clamp-3 text-sm leading-6 text-muted">{destination.description}</p>
                    {destination.packages.length > 0 && (
                      <ul className="mt-5 space-y-3 border-t border-line pt-4">
                        {destination.packages.slice(0, 3).map((pkg) => (
                          <li key={pkg.slug} className="flex items-start justify-between gap-3 text-sm">
                            <span className="min-w-0">
                              {pkg.title}
                              <span className="block pt-0.5 text-xs text-muted">{pkg.durationDays} days · Price on request</span>
                            </span>
                            <Link href={`/booking?package=${encodeURIComponent(pkg.slug)}`} className="shrink-0 text-xs font-semibold text-accent hover:underline">Enquire</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href={`/destinations/${destination.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-accent">
                      View details <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="mt-10 text-xs leading-5 text-muted">
          Catalogue entries are starting points for enquiries, not confirmation of inventory. Supplier, permit, visa, pricing and availability details are checked before confirmation.
        </p>
      </div>
    </main>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<DestinationsLoading />}>
      <DestinationsContent />
    </Suspense>
  );
}

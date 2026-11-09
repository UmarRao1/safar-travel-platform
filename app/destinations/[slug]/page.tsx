import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPlaceImage } from "@/lib/place-images";
import { PageHero } from "@/components/ui/PageHero";
import { TripMapSection, TripMapSkeleton } from "@/components/travel/TripMapSection";

type DestinationPageProps = { params: Promise<{ slug: string }> };
export const instant = false;

export default async function DestinationDetailPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  await connection();

  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: { packages: { where: { isActive: true }, orderBy: { durationDays: "asc" } } },
  });
  if (!destination) notFound();

  const photo = destination.imageUrl || (await getPlaceImage(`${destination.name} ${destination.country}`, 2000));

  return (
    <main>
      <PageHero
        image={photo}
        imageAlt={`${destination.name}, ${destination.country}`}
        tall
        meta={<Link href="/destinations" className="inline-flex items-center gap-1.5 hover:text-white"><ArrowLeft size={14} /> All destinations · {destination.country}</Link>}
        title={destination.name}
        description={destination.description}
      >
        <Link href="/booking" className="btn btn-light">Request a quotation</Link>
        <Link href={`/plan-trip?destination=${encodeURIComponent(destination.name)}`} className="btn btn-ghost-light">Plan with AI</Link>
      </PageHero>

      <div className="container-page space-y-16 py-12 sm:py-16">
        <section aria-labelledby="tours">
          <h2 id="tours" className="text-2xl font-semibold sm:text-3xl">Tour options</h2>
          <p className="mt-2 max-w-2xl text-muted">Final prices, suppliers and availability are confirmed by the Safar team.</p>

          {destination.packages.length === 0 ? (
            <div className="card mt-6 p-6">
              <h3 className="font-semibold">Tours coming soon</h3>
              <p className="mt-2 text-sm leading-6 text-muted">No active tours are listed yet. You can still ask us for a customised trip.</p>
              <Link href="/booking" className="btn btn-primary mt-5">Discuss your trip</Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {destination.packages.map((tour) => (
                <article key={tour.id} className="card flex flex-col p-6">
                  <span className="badge self-start"><Clock size={13} /> {tour.durationDays} days</span>
                  <h3 className="mt-4 text-xl font-semibold">{tour.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{tour.description}</p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">Price on request</span>
                    <Link href={`/booking?package=${encodeURIComponent(tour.slug)}`} className="btn btn-primary btn-sm">Request a quotation <ArrowRight size={14} /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="nearby">
          <h2 id="nearby" className="text-2xl font-semibold sm:text-3xl">Hotels, restaurants and places nearby</h2>
          <div className="mt-6">
            <Suspense fallback={<TripMapSkeleton />}>
              <TripMapSection destination={`${destination.name}, ${destination.country}`} />
            </Suspense>
          </div>
        </section>

        <p className="text-xs leading-6 text-muted">
          Tour descriptions are for planning. Prices, accommodation, transport, permits, visas and availability need confirmation before a booking is finalised.
        </p>
      </div>
    </main>
  );
}

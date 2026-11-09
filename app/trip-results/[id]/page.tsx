import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Clock, Sun, Sunrise, Sunset, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPlaceImage } from "@/lib/place-images";
import type { TripMapData } from "@/lib/geo";
import { PageHero } from "@/components/ui/PageHero";
import { TripMapSection, TripMapSkeleton } from "@/components/travel/TripMapSection";

export const instant = false;

type DayPlan = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  notes?: string;
};

type BudgetBreakdown = {
  currency: string;
  nights: number;
  accommodation: number;
  meals: number;
  localTransport: number;
  activities: number;
  intercityTransport: number | null;
  contingency: number;
  subtotal: number;
  total: number;
  perPerson: number;
  rateAssumptions: {
    accommodationPerPersonPerNight: number;
    mealsPerPersonPerDay: number;
    localTransportPerPersonPerDay: number;
    activitiesPerPersonPerDay: number;
    contingencyPercent: number;
  };
  excluded: string[];
};

type TripItinerary = {
  title: string;
  summary: string;
  itinerary: DayPlan[];
  practicalTips: string[];
  followUpQuestions: string[];
  budgetBreakdown: BudgetBreakdown;
  planningDisclaimer: string;
  mapData?: TripMapData;
};

type TripSource = { title: string; url: string; content: string };

function money(value: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function TripResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connection();

  const trip = await prisma.tripPlan.findUnique({ where: { id } });
  if (!trip) notFound();

  const result = trip.itinerary as unknown as TripItinerary;
  const sources = Array.isArray(trip.sources) ? (trip.sources as unknown as TripSource[]) : [];
  const budget = result.budgetBreakdown;
  const heroImage = await getPlaceImage(trip.destinationText, 2000);

  const slots = [
    { key: "morning", label: "Morning", Icon: Sunrise },
    { key: "afternoon", label: "Afternoon", Icon: Sun },
    { key: "evening", label: "Evening", Icon: Sunset },
  ] as const;

  return (
    <main>
      <PageHero
        image={heroImage}
        imageAlt={trip.destinationText}
        meta={
          <>
            <span className="badge !bg-white/15 !text-white">Planning estimate · not a booking</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {trip.durationDays} days, {budget.nights} nights</span>
            <span className="inline-flex items-center gap-1.5"><Users size={14} /> {trip.travelers} travellers</span>
          </>
        }
        title={result.title}
        description={result.summary}
      >
        <Link href="/plan-trip" className="btn btn-ghost-light"><ArrowLeft size={16} /> New plan</Link>
        <Link href="/booking" className="btn btn-light">Request a quote for this trip</Link>
      </PageHero>

      <div className="container-page space-y-16 py-12 sm:py-16">
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Estimated group total", money(budget.total), "Based on configurable planning allowances"],
            ["Estimated per person", money(budget.perPerson), "Group total divided across travellers"],
            ["Web research", `${sources.length} sources`, "Open the links below to verify details"],
          ].map(([label, value, note]) => (
            <div key={label} className="card p-5">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted">{note}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="map-heading">
          <h2 id="map-heading" className="text-2xl font-semibold sm:text-3xl">Where to stay, eat and explore</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Hotels, restaurants and places to visit near {trip.destinationText}. Pick a place in the list to find it on the map.
          </p>
          <div className="mt-6">
            <Suspense fallback={<TripMapSkeleton />}>
              <TripMapSection tripId={trip.id} destination={trip.destinationText} existing={result.mapData ?? null} />
            </Suspense>
          </div>
        </section>

        <section aria-labelledby="itinerary-heading">
          <h2 id="itinerary-heading" className="text-2xl font-semibold sm:text-3xl">Day by day</h2>
          <ol className="mt-6 space-y-4">
            {result.itinerary.map((day) => (
              <li key={day.day} className="card p-5 sm:p-7">
                <div className="flex items-baseline gap-3">
                  <span className="badge">Day {day.day}</span>
                  <h3 className="text-lg font-semibold sm:text-xl">{day.title}</h3>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  {slots.map(({ key, label, Icon }) => (
                    <div key={key}>
                      <p className="flex items-center gap-2 text-sm font-semibold"><Icon size={15} className="text-accent" /> {label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{day[key]}</p>
                    </div>
                  ))}
                </div>
                {day.notes && <p className="mt-5 rounded-lg bg-surface-2 p-3 text-sm leading-6 text-muted">{day.notes}</p>}
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Budget breakdown</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Calculated from the planning allowances configured for this Safar installation.</p>
            <dl className="mt-5 text-sm">
              {[
                ["Accommodation", budget.accommodation],
                ["Meals", budget.meals],
                ["Local transport", budget.localTransport],
                ["Activities", budget.activities],
                ["Contingency", budget.contingency],
              ].map(([label, amount]) => (
                <div key={String(label)} className="flex justify-between gap-4 border-b border-line py-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium">{money(Number(amount))}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 pt-4 text-base font-semibold">
                <dt>Estimated total</dt>
                <dd>{money(budget.total)}</dd>
              </div>
            </dl>
            <div className="mt-5 rounded-lg bg-surface-2 p-4 text-sm leading-6 text-muted">
              <p className="font-semibold text-ink">Not included</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">{budget.excluded.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold">Practical tips</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
              {result.practicalTips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
            {result.followUpQuestions.length > 0 && (
              <>
                <h3 className="mt-7 font-semibold">Things to decide next</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
                  {result.followUpQuestions.map((q) => <li key={q}>{q}</li>)}
                </ul>
              </>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Research sources</h2>
          <p className="mt-2 text-sm text-muted">Returned during planning. Check each source before relying on time-sensitive details.</p>
          {sources.length === 0 ? (
            <p className="card mt-4 p-5 text-sm text-muted">No search sources were returned for this plan.</p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="card block p-5 transition hover:border-accent">
                  <p className="font-semibold">{source.title}</p>
                  <p className="mt-1 break-all text-xs text-muted">{source.url}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{source.content}</p>
                </a>
              ))}
            </div>
          )}
        </section>

        <p className="text-xs leading-6 text-muted">
          {result.planningDisclaimer} Verify supplier prices, availability, seasonal access, weather and travel requirements before making decisions.
        </p>
      </div>
    </main>
  );
}

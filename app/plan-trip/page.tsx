import { Suspense } from "react";
import { Map, Route, Wallet } from "lucide-react";
import { curatedImage, GENERIC_MOUNTAINS } from "@/lib/place-images";
import { PageHero } from "@/components/ui/PageHero";
import TripPlannerForm from "./TripPlannerForm";

export const metadata = {
  title: "AI Trip Planner | Safar",
  description: "Create a personalised itinerary with a map of nearby hotels and restaurants and a transparent planning budget.",
};

const features = [
  { Icon: Route, title: "Day-by-day itinerary", text: "A practical first draft shaped by your group, pace and style." },
  { Icon: Map, title: "Map with hotels and restaurants", text: "See where to stay, eat and explore around your destination." },
  { Icon: Wallet, title: "Transparent budget", text: "Clearly labelled planning allowances, not a supplier quote." },
];

async function PlannerBody({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  const { destination } = await searchParams;
  return <TripPlannerForm initialDestination={destination?.slice(0, 160) ?? ""} initialImage={destination ? curatedImage(destination, 1200) : null} />;
}

export default function PlanTripPage({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  return (
    <main>
      <PageHero
        image={curatedImage("hunza", 2000) ?? GENERIC_MOUNTAINS(2000)}
        imageAlt="Mountain valley in northern Pakistan"
        title="A trip shaped around you."
        description="Tell Safar where you want to go. Get an itinerary, a budget, and a map of nearby hotels and restaurants."
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.35fr] lg:py-16">
        <aside className="space-y-6 lg:pt-2">
          {features.map(({ Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Icon size={19} /></span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
              </div>
            </div>
          ))}
        </aside>
        <section className="card p-5 sm:p-8" aria-labelledby="planner-heading">
          <h2 id="planner-heading" className="text-xl font-semibold">Plan your journey</h2>
          <p className="mt-1 text-sm text-muted">Start with the basics. A budget is optional.</p>
          <div className="mt-6">
            <Suspense fallback={<div className="skeleton h-96" />}>
              <PlannerBody searchParams={searchParams} />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}

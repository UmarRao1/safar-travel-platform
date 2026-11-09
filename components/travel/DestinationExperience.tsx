import Link from "next/link";
import { Check } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { getPlaceImage } from "@/lib/place-images";
import { ItineraryTimeline, type ItineraryDay } from "./ItineraryTimeline";

export type DestinationExperienceProps = {
  name: string;
  region: string;
  summary: string;
  durationLabel?: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  included?: string[];
  notIncluded?: string[];
  enquiryHref?: string;
};

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="card p-5 sm:p-6">
      <h3 className="font-semibold">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-muted">
              <Check size={16} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">Details will be confirmed in your personalised quotation.</p>
      )}
    </section>
  );
}

export async function DestinationExperience({
  name, region, summary, durationLabel, highlights, itinerary, included = [], notIncluded = [], enquiryHref = "/booking",
}: DestinationExperienceProps) {
  const image = await getPlaceImage(`${name} ${region}`, 2000);
  return (
    <main>
      <PageHero
        image={image}
        imageAlt={`${name}, ${region}`}
        tall
        meta={<><span>{region}</span>{durationLabel && <span>· {durationLabel}</span>}</>}
        title={name}
        description={summary}
      >
        <Link href={enquiryHref} className="btn btn-light">Request a quotation</Link>
      </PageHero>

      <div className="container-page space-y-16 py-12 sm:py-16">
        <section aria-labelledby="destination-highlights">
          <h2 id="destination-highlights" className="text-2xl font-semibold sm:text-3xl">What makes this place special</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((highlight) => (
              <p key={highlight} className="card p-5 font-medium leading-6">{highlight}</p>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div>
            <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">Suggested itinerary</h2>
            <ItineraryTimeline days={itinerary} />
          </div>
          <aside className="space-y-4">
            <ListPanel title="What may be included" items={included} />
            <ListPanel title="Usually not included" items={notIncluded} />
            <div className="rounded-2xl bg-accent p-6 text-white">
              <h3 className="text-lg font-semibold">Make this trip yours</h3>
              <p className="mt-2 text-sm leading-6 text-white/85">Tell us your dates, group size and comfort level. Details are confirmed before booking.</p>
              <Link href={enquiryHref} className="btn btn-light mt-5">Request a quotation</Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

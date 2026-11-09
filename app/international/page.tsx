import Link from "next/link";
import { ArrowRight, Globe2, MapPin } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { PageHero } from "@/components/ui/PageHero";
import { GENERIC_WORLD } from "@/lib/place-images";

export const metadata = {
  title: "International Travel | Safar",
  description: "Explore international travel ideas and request a personalised travel quotation with Safar.",
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;

const destinations = [
  { name: "Dubai", country: "United Arab Emirates", description: "Contemporary architecture, desert experiences and city attractions.", image: u("1512453979798-5ea266f8880c") },
  { name: "Istanbul", country: "Türkiye", description: "Historic landmarks, waterfront views and vibrant local culture.", image: u("1524231757912-21f4fe3a7200") },
  { name: "Kuala Lumpur", country: "Malaysia", description: "A lively city of food, shopping and iconic skylines.", image: u("1596422846543-75c6fc197f07") },
  { name: "Bangkok", country: "Thailand", description: "Street food, markets, temples and a bustling urban atmosphere.", image: u("1508009603885-50cf7c579365") },
  { name: "Baku", country: "Azerbaijan", description: "Caspian Sea views, historic streets and modern architecture.", image: u("1565008576549-57569a49371d") },
];

export default function InternationalPage() {
  return (
    <main>
      <PageHero
        image={GENERIC_WORLD(2000)}
        imageAlt="Traveller looking over a mountain lake"
        title="The world is waiting. Where will you go?"
        description="Tell us your dates, group size and budget, and request a trip quotation tailored to your plans."
      >
        <Link href="/booking" className="btn btn-light">Plan your international trip <ArrowRight size={16} /></Link>
        <Link href="/plan-trip" className="btn btn-ghost-light">Plan with AI</Link>
      </PageHero>

      <section className="container-page section-y">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">Destinations to discover</h2>
            <p className="mt-3 max-w-xl text-muted">A few ideas to start from. Choose one and we&apos;ll discuss your requirements.</p>
          </div>
          <Link href="/booking" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
            Request a quotation <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <article key={d.name} className="card group overflow-hidden">
              <div className="relative h-56 overflow-hidden bg-surface-2">
                <Photo src={d.image} alt={`${d.name}, ${d.country}`} className="h-full w-full transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} /> {d.country}</p>
                <h3 className="mt-1.5 text-xl font-semibold">{d.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{d.description}</p>
                <div className="mt-5 flex gap-4 text-sm font-semibold text-accent">
                  <Link href="/booking" className="inline-flex items-center gap-1.5 hover:underline">Enquire <ArrowRight size={14} /></Link>
                  <Link href={`/plan-trip?destination=${encodeURIComponent(`${d.name}, ${d.country}`)}`} className="hover:underline">Plan with AI</Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="card mt-12 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Globe2 size={19} /></span>
            <div>
              <h3 className="font-semibold">Have another country in mind?</h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted">You don&apos;t have to choose from this list. Send us your preferred destination and we&apos;ll discuss arrangements.</p>
            </div>
          </div>
          <Link href="/booking" className="btn btn-primary shrink-0">Request a trip quote</Link>
        </div>
        <p className="mt-8 text-xs leading-6 text-muted">Destination examples are for inspiration. Availability, arrangements, prices and bookings must be confirmed separately.</p>
      </section>
    </main>
  );
}

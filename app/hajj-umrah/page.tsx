
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { PageHero } from "@/components/ui/PageHero";
import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Hajj & Umrah | Safar",
  description:
    "Explore Hajj and Umrah enquiry options and discuss your pilgrimage travel plans with Safar.",
};

const options = [
  {
    title: "Umrah — 10 days",
    description:
      "Discuss a shorter pilgrimage itinerary and your preferred travel dates.",
    duration: "10 days",
    icon: CalendarDays,
  },
  {
    title: "Umrah — 14 days",
    description:
      "Explore a longer stay with time to discuss your accommodation and travel needs.",
    duration: "14 days",
    icon: MapPin,
  },
  {
    title: "Ramadan Umrah",
    description:
      "Share your preferred dates and ask about possible Ramadan arrangements.",
    duration: "Dates by enquiry",
    icon: HeartHandshake,
  },
  {
    title: "Hajj enquiry",
    description:
      "Tell us about your pilgrimage requirements and request further information.",
    duration: "Details by enquiry",
    icon: ShieldCheck,
  },
];

const kaabaImage =
  "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1800&q=90";

const madinahImage =
  "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=85";

export default function HajjUmrahPage() {
  return (
    <main>
      <PageHero
        image={kaabaImage}
        imageAlt="The Kaaba in Makkah"
        tall
        title="Hajj & Umrah, with peace of mind."
        description="Share your dates, group size and preferences. We'll discuss suitable arrangements before you make any booking decision."
      >
        <Link href="#packages" className="btn btn-light">Explore options <ArrowRight size={16} /></Link>
        <Link href="/booking" className="btn btn-ghost-light">Make an enquiry</Link>
      </PageHero>

      <section id="packages" className="container-page section-y">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">Which journey are you considering?</h2>
            <p className="mt-3 leading-7 text-muted">
              These are enquiry templates, not confirmed offers. Final availability, services and prices need to be confirmed.
            </p>
          </div>
          <div className="relative hidden h-32 overflow-hidden rounded-xl bg-surface-2 lg:block">
            <Photo src={madinahImage} alt="Mosque architecture in Madinah" className="h-full w-full" />
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <article key={option.title} className="card flex flex-col p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent"><Icon size={19} /></span>
                <p className="mt-5 text-sm text-muted">{option.duration}</p>
                <h3 className="mt-1 text-lg font-semibold">{option.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">{option.description}</p>
                <Link href="/booking" className="btn btn-secondary btn-sm mt-6">Make an enquiry <ArrowRight size={14} /></Link>
              </article>
            );
          })}
        </div>

        <div className="card mt-12 p-6 sm:p-8">
          <h3 className="font-semibold">Important information</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
            Submitting an enquiry does not confirm a booking, visa, flight, accommodation or pilgrimage package. All arrangements, eligibility requirements, availability and prices must be verified with the relevant providers and authorities before travel.
          </p>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { ArrowRight, BedDouble, Globe2, Landmark, MapPin, Mountain, Search, Sparkles, Utensils } from "lucide-react";
import { curatedImage, GENERIC_MOUNTAINS } from "@/lib/place-images";
import { Photo } from "@/components/ui/Photo";

const destinations = [
  { name: "Hunza Valley", region: "Gilgit-Baltistan", text: "Turquoise lakes, mountain villages and open valley views." },
  { name: "Skardu", region: "Gilgit-Baltistan", text: "Dramatic peaks, quiet lakes and high desert landscapes." },
  { name: "Swat Valley", region: "Khyber Pakhtunkhwa", text: "Green valleys, rivers and cool alpine air." },
];

const categories = [
  { icon: Mountain, title: "Pakistan tours", text: "Northern valleys, lakes and mountain trails.", href: "/destinations", image: curatedImage("hunza", 900) },
  { icon: Globe2, title: "International", text: "Dubai, Istanbul, Bangkok and more.", href: "/international", image: curatedImage("istanbul", 900) },
  { icon: Landmark, title: "Hajj & Umrah", text: "Pilgrimage enquiries handled with care.", href: "/hajj-umrah", image: curatedImage("makkah", 900) },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0e1612] text-white">
        <Photo src={curatedImage("hunza", 2200) ?? GENERIC_MOUNTAINS(2200)} alt="Hunza Valley and the Karakoram mountains" priority className="absolute inset-0 -z-20 h-full w-full" />
        <div className="img-scrim-side absolute inset-0 -z-10" />
        <div className="container-page flex min-h-[36rem] flex-col justify-center py-20 sm:min-h-[40rem]">
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] sm:text-7xl">Travel Pakistan and beyond, planned well.</h1>
          <p className="mt-6 max-w-lg text-lg leading-7 text-white/80">
            Discover destinations, get an AI-built itinerary with a map of hotels and restaurants, and request a clear quote.
          </p>

          <form action="/plan-trip" method="get" className="mt-9 flex w-full max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
            <label htmlFor="home-destination" className="sr-only">Where do you want to go?</label>
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search size={18} className="shrink-0 text-[#5b6a61]" />
              <input
                id="home-destination"
                name="destination"
                placeholder="Where do you want to go?"
                maxLength={160}
                className="h-11 w-full bg-transparent text-[15px] text-[#14201a] outline-none placeholder:text-[#7a877f]"
              />
            </div>
            <button type="submit" className="btn btn-primary min-h-11"><Sparkles size={16} /> Plan with AI</button>
          </form>
        </div>
      </section>

      {/* Destinations */}
      <section className="container-page section-y" id="destinations">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">Places that stay with you</h2>
            <p className="mt-3 max-w-md text-muted">Start with the landscapes that make Pakistan extraordinary.</p>
          </div>
          <Link href="/destinations" className="hidden items-center gap-1.5 text-sm font-semibold text-accent hover:underline sm:inline-flex">
            All destinations <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {destinations.map((d) => (
            <Link key={d.name} href="/destinations" className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2">
              <Photo src={curatedImage(d.name, 1000)} alt={`${d.name}, ${d.region}`} className="h-full w-full transition duration-700 group-hover:scale-105" />
              <div className="img-scrim absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="flex items-center gap-1.5 text-xs text-white/80"><MapPin size={13} /> {d.region}</p>
                <h3 className="mt-2 text-2xl font-semibold">{d.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">{d.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page pb-[clamp(3.5rem,8vw,6rem)]" id="international">
        <h2 className="text-3xl font-semibold sm:text-4xl">Every journey has its own shape</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {categories.map(({ icon: Icon, title, text, href, image }) => (
            <Link key={title} href={href} className="card group overflow-hidden transition hover:border-accent">
              <div className="relative h-44 overflow-hidden bg-surface-2">
                <Photo src={image} alt={title} className="h-full w-full transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex items-start gap-3 p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Icon size={18} /></span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI planner */}
      <section className="border-y border-line bg-surface" id="planner">
        <div className="container-page section-y grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">An itinerary and a map, in one minute</h2>
            <p className="mt-4 max-w-md leading-7 text-muted">
              Tell the planner where you&apos;re going, how many people and for how long. You get a day-by-day plan, a budget estimate and a map of nearby hotels and restaurants.
            </p>
            <Link href="/plan-trip" className="btn btn-primary mt-8"><Sparkles size={16} /> Open the AI planner</Link>
            <p className="mt-4 text-xs text-muted">Plans and prices are estimates until reviewed and confirmed.</p>
          </div>
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-surface-2">
              <Photo src={curatedImage("skardu", 1400)} alt="Lake and mountains near Skardu" className="h-full w-full" />
            </div>
            <div className="card absolute -bottom-6 left-4 right-4 p-4 shadow-[var(--shadow)] sm:left-auto sm:right-[-1rem] sm:w-72">
              <p className="text-sm font-semibold">Near Skardu</p>
              <ul className="mt-3 space-y-2.5 text-sm text-muted">
                <li className="flex items-center gap-2.5"><span className="grid h-6 w-6 place-items-center rounded-md bg-blue-600 text-white"><BedDouble size={13} /></span> Hotels and guest houses</li>
                <li className="flex items-center gap-2.5"><span className="grid h-6 w-6 place-items-center rounded-md bg-orange-600 text-white"><Utensils size={13} /></span> Restaurants and cafes</li>
                <li className="flex items-center gap-2.5"><span className="grid h-6 w-6 place-items-center rounded-md bg-green-700 text-white"><MapPin size={13} /></span> Places to see</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Hajj & Umrah */}
      <section className="container-page section-y">
        <div className="relative isolate overflow-hidden rounded-2xl bg-[#0e1612] text-white">
          <Photo src={curatedImage("makkah", 1800)} alt="The Kaaba in Makkah" className="absolute inset-0 -z-20 h-full w-full" />
          <div className="img-scrim-side absolute inset-0 -z-10" />
          <div className="flex flex-col gap-6 p-8 sm:p-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-lg">
              <h2 className="text-3xl font-semibold">Hajj &amp; Umrah, with care</h2>
              <p className="mt-3 leading-7 text-white/80">Request a package tailored to your dates, group size and requirements.</p>
            </div>
            <Link href="/hajj-umrah" className="btn btn-light">Enquire about packages <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

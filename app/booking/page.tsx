
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import BookingForm from "./BookingForm";
import { PageHero } from "@/components/ui/PageHero";
import { getPlaceImage, curatedImage, GENERIC_MOUNTAINS } from "@/lib/place-images";

export const instant = false;

type BookingPageProps = {
  searchParams: Promise<{ package?: string | string[] }>;
};

export default async function BookingPage({
  searchParams,
}: BookingPageProps) {
  await connection();

  const query = await searchParams;
  const requestedSlug = Array.isArray(query.package)
    ? query.package[0]
    : query.package;

  const packages = await prisma.tourPackage.findMany({
    where: { isActive: true },
    orderBy: [{ title: "asc" }],
    select: {
      slug: true,
      title: true,
      durationDays: true,
      destination: { select: { name: true } },
    },
  });

  const selectedSlug = packages.some(
    (tour) => tour.slug === requestedSlug,
  )
    ? requestedSlug!
    : "";

  const selected = packages.find((tour) => tour.slug === selectedSlug);
  const image = selected
    ? await getPlaceImage(selected.destination.name, 2000)
    : curatedImage("hunza", 2000) ?? GENERIC_MOUNTAINS(2000);

  return (
    <main>
      <PageHero
        image={image}
        imageAlt={selected ? selected.destination.name : "Mountain valley in northern Pakistan"}
        title="Request a travel quotation"
        description={
          selected
            ? `You're enquiring about ${selected.destination.name} — ${selected.title}.`
            : "Share your travel details and our team will prepare a suitable proposal."
        }
      />
      <div className="container-page max-w-3xl py-12 sm:py-16">
        <BookingForm
          packages={packages.map((tour) => ({
            slug: tour.slug,
            title: `${tour.destination.name} — ${tour.title}`,
            destinationName: tour.destination.name,
            durationDays: tour.durationDays,
          }))}
          initialPackageSlug={selectedSlug}
        />
      </div>
    </main>
  );
}

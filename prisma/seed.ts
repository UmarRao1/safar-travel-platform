
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const destinations = [
    {
      name: "Hunza Valley",
      slug: "hunza-valley",
      country: "Pakistan",
      description:
        "Explore mountain scenery, traditional villages, Attabad Lake, and the beautiful landscapes of Gilgit-Baltistan.",
      isFeatured: true,
    },
    {
      name: "Skardu",
      slug: "skardu",
      country: "Pakistan",
      description:
        "Discover dramatic mountains, cold deserts, alpine lakes, and the remarkable landscapes of Gilgit-Baltistan.",
      isFeatured: true,
    },
    {
      name: "Swat Valley",
      slug: "swat-valley",
      country: "Pakistan",
      description:
        "Enjoy green valleys, rivers, forests, and mountain escapes in northern Khyber Pakhtunkhwa.",
      isFeatured: true,
    },
  ];

  for (const destinationData of destinations) {
    const destination = await prisma.destination.upsert({
      where: { slug: destinationData.slug },
      update: destinationData,
      create: destinationData,
    });

    console.log(`Destination ready: ${destination.name}`);

    const packages = [
      {
        title: `${destination.name} Explorer`,
        slug: `${destinationData.slug}-explorer`,
        description: `Discover the highlights of ${destination.name} on a planned sightseeing trip. Contact us for a tailored quotation.`,
        tripType: "DOMESTIC" as const,
        durationDays: 5,
        currency: "PKR",
        isActive: true,
        destinationId: destination.id,
      },
      {
        title: `${destination.name} Weekend Escape`,
        slug: `${destinationData.slug}-weekend-escape`,
        description: `Enjoy a shorter getaway to ${destination.name}. The itinerary and final price will be confirmed with your quotation.`,
        tripType: "DOMESTIC" as const,
        durationDays: 3,
        currency: "PKR",
        isActive: true,
        destinationId: destination.id,
      },
    ];

    for (const packageData of packages) {
      await prisma.tourPackage.upsert({
        where: { slug: packageData.slug },
        update: packageData,
        create: packageData,
      });

      console.log(`  Package ready: ${packageData.title}`);
    }
  }

  console.log("\nTravel seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

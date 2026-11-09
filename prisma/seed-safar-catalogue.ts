import { prisma } from "../lib/prisma";

const destinations = [
  { name: "Hunza Valley", slug: "hunza-valley", country: "Pakistan", description: "Mountain villages, high peaks, turquoise lakes and scenic roads in Gilgit-Baltistan.", isFeatured: true },
  { name: "Skardu", slug: "skardu", country: "Pakistan", description: "A gateway to dramatic mountain scenery, cold deserts, lakes and high-altitude adventures.", isFeatured: true },
  { name: "Swat Valley", slug: "swat-valley", country: "Pakistan", description: "Green valleys, rivers, forests and family-friendly nature escapes in northern Pakistan.", isFeatured: true },
  { name: "Dubai", slug: "dubai", country: "United Arab Emirates", description: "A flexible city escape with skyline views, cultural districts, desert experiences and family activities.", isFeatured: true },
  { name: "Istanbul", slug: "istanbul", country: "Türkiye", description: "Historic neighbourhoods, waterfront views, markets and a distinctive food culture.", isFeatured: true },
  { name: "Kuala Lumpur", slug: "kuala-lumpur", country: "Malaysia", description: "Modern city sights, local food, green spaces and optional day trips.", isFeatured: false },
  { name: "Bangkok", slug: "bangkok", country: "Thailand", description: "Markets, river journeys, cultural sights and a wide range of local food experiences.", isFeatured: false },
  { name: "Baku", slug: "baku", country: "Azerbaijan", description: "Old-town streets, modern architecture, Caspian waterfront views and possible day excursions.", isFeatured: false },
  { name: "Makkah", slug: "makkah", country: "Saudi Arabia", description: "A central destination for Umrah and Hajj enquiries. Arrangements depend on current rules and confirmed providers.", isFeatured: true },
  { name: "Madinah", slug: "madinah", country: "Saudi Arabia", description: "A significant pilgrimage destination. Travel details and accommodation are subject to confirmation.", isFeatured: true },
];

const packages = [
  { title: "Hunza Scenic Escape", slug: "hunza-scenic-escape", description: "An enquiry-based northern Pakistan itinerary with scenic stops, accommodation preferences and transport to be confirmed.", tripType: "DOMESTIC" as const, durationDays: 5, currency: "PKR", destinationSlug: "hunza-valley" },
  { title: "Skardu Lakes & Mountains", slug: "skardu-lakes-mountains", description: "A proposed Skardu trip for lakes, mountain views and local excursions; exact route and access are confirmed after enquiry.", tripType: "DOMESTIC" as const, durationDays: 6, currency: "PKR", destinationSlug: "skardu" },
  { title: "Swat Nature Retreat", slug: "swat-nature-retreat", description: "A flexible Swat Valley trip idea for rivers, green landscapes and relaxed sightseeing.", tripType: "DOMESTIC" as const, durationDays: 4, currency: "PKR", destinationSlug: "swat-valley" },
  { title: "Dubai City Break", slug: "dubai-city-break", description: "An international travel enquiry for a Dubai city stay. Flights, hotel category, visas and activities require individual confirmation.", tripType: "INTERNATIONAL" as const, durationDays: 5, currency: "PKR", destinationSlug: "dubai" },
  { title: "Istanbul Culture & History", slug: "istanbul-culture-history", description: "An Istanbul itinerary enquiry focused on historic districts, food and waterfront areas. Final inclusions are confirmed with the traveller.", tripType: "INTERNATIONAL" as const, durationDays: 6, currency: "PKR", destinationSlug: "istanbul" },
  { title: "Kuala Lumpur City & Nature", slug: "kuala-lumpur-city-nature", description: "A flexible Malaysia travel enquiry covering city highlights, local food and optional day trips.", tripType: "INTERNATIONAL" as const, durationDays: 5, currency: "PKR", destinationSlug: "kuala-lumpur" },
  { title: "Bangkok Discovery", slug: "bangkok-discovery", description: "A Thailand travel enquiry for city neighbourhoods, markets and cultural attractions; all arrangements are subject to review.", tripType: "INTERNATIONAL" as const, durationDays: 5, currency: "PKR", destinationSlug: "bangkok" },
  { title: "Baku Short Break", slug: "baku-short-break", description: "A short Azerbaijan travel enquiry for old-town sights and the waterfront. Current entry requirements must be checked.", tripType: "INTERNATIONAL" as const, durationDays: 4, currency: "PKR", destinationSlug: "baku" },
  { title: "Umrah — 10 Days", slug: "umrah-10-days", description: "Umrah package enquiry. Dates, flights, hotel details, transport and any required authorisations must be verified before confirmation.", tripType: "HAJJ_UMRAH" as const, durationDays: 10, currency: "PKR", destinationSlug: "makkah" },
  { title: "Umrah — 14 Days", slug: "umrah-14-days", description: "A longer Umrah enquiry. Makkah and Madinah arrangements, dates, hotel category and transport are subject to confirmation.", tripType: "HAJJ_UMRAH" as const, durationDays: 14, currency: "PKR", destinationSlug: "makkah" },
  { title: "Ramadan Umrah Enquiry", slug: "ramadan-umrah-enquiry", description: "Ramadan Umrah enquiry. Availability, dates, pricing and current rules must be verified with authorised providers.", tripType: "HAJJ_UMRAH" as const, durationDays: 14, currency: "PKR", destinationSlug: "makkah" },
  { title: "Hajj Package Enquiry", slug: "hajj-package-enquiry", description: "Hajj season enquiry only. Eligibility, official arrangements, permits and authorised-provider status must be checked for the relevant season.", tripType: "HAJJ_UMRAH" as const, durationDays: 30, currency: "PKR", destinationSlug: "makkah" },
];

async function main() {
  const destinationIds = new Map<string, string>();
  for (const destination of destinations) {
    const saved = await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: {
        name: destination.name,
        country: destination.country,
        description: destination.description,
        isFeatured: destination.isFeatured,
      },
      create: destination,
    });
    destinationIds.set(destination.slug, saved.id);
  }

  for (const item of packages) {
    const destinationId = destinationIds.get(item.destinationSlug);
    if (!destinationId) throw new Error(`Missing destination: ${item.destinationSlug}`);
    await prisma.tourPackage.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        tripType: item.tripType,
        durationDays: item.durationDays,
        currency: item.currency,
        destinationId,
        isActive: true,
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        tripType: item.tripType,
        durationDays: item.durationDays,
        currency: item.currency,
        destinationId,
        isActive: true,
        estimatedPrice: null,
      },
    });
  }

  console.log(`Safar catalogue seeded: ${destinations.length} destinations and ${packages.length} enquiry packages.`);
  console.log("No estimated prices were added. These are enquiry templates, not confirmed inventory.");
}

main()
  .catch((error) => {
    console.error("Failed to seed Safar catalogue:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

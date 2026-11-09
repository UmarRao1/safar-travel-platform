import { DestinationExperience } from "@/components/travel/DestinationExperience";
import type { ItineraryDay } from "@/components/travel/ItineraryTimeline";

const sampleItinerary: ItineraryDay[] = [
  {
    day: 1,
    title: "Arrival and journey briefing",
    description: "Meet your local coordinator, review the route, and settle into your accommodation.",
    overnight: "Hunza (to be confirmed)",
  },
  {
    day: 2,
    title: "Explore Karimabad",
    description: "Keep the day flexible for village walks, local food, and viewpoints, depending on weather and group pace.",
    overnight: "Hunza (to be confirmed)",
  },
  {
    day: 3,
    title: "Scenic valley day",
    description: "Plan a relaxed outing with stops selected around road conditions, season, and your interests.",
    overnight: "Accommodation to be confirmed",
  },
];

export default function TravelExperienceDemoPage() {
  return (
    <DestinationExperience
      name="Hunza Valley"
      region="Gilgit-Baltistan, Pakistan"
      durationLabel="Illustrative 3-day sample"
      summary="A sample of how Safar can present a destination with a clear overview, a flexible itinerary, and an enquiry-first booking journey."
      highlights={[
        "Mountain scenery and wide valley viewpoints",
        "Local culture, village walks, and regional food",
        "A flexible pace tailored to your group and season",
      ]}
      itinerary={sampleItinerary}
      included={[
        "A personalized itinerary proposal",
        "Accommodation and transport options listed in the quotation",
        "A clear summary of confirmed inclusions before payment",
      ]}
      notIncluded={[
        "Any service not explicitly listed in the final quotation",
        "Personal expenses and optional activities",
      ]}
      enquiryHref="/booking"
    />
  );
}

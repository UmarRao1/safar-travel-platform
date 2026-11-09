"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { useRouter } from "next/navigation";

export default function TripPlannerForm({ initialDestination = "", initialImage = null }: { initialDestination?: string; initialImage?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [destination, setDestination] = useState(initialDestination);
  const [preview, setPreview] = useState<string | null>(initialImage);

  // Show a photo that matches the destination as the traveller types.
  useEffect(() => {
    const q = destination.trim();
    if (q.length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/place-image?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const json = (await res.json()) as { url?: string };
        if (json.url) setPreview(json.url);
      } catch { /* keep the previous preview */ }
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [destination]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      destination: String(formData.get("destination") ?? "").trim(),
      departureCity: String(formData.get("departureCity") ?? "").trim(),
      travelers: Number(formData.get("travelers")),
      durationDays: Number(formData.get("durationDays")),
      budget: String(formData.get("budget") ?? "").trim()
        ? Number(formData.get("budget"))
        : undefined,
      travelStyle: String(formData.get("travelStyle") ?? "budget"),
      transportPreference: String(formData.get("transportPreference") ?? "not-decided"),
      preferences: String(formData.get("preferences") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/ai/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !result.id) {
        setError(result.error ?? "We couldn't create your trip plan. Please try again.");
        return;
      }

      router.push(`/trip-results/${result.id}`);
    } catch {
      setError("The planner could not connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="destination" className="label">
          Where do you want to go? *
        </label>
        <input
          id="destination"
          name="destination"
          required
          minLength={2}
          maxLength={160}
          placeholder="e.g. Hunza Valley, Pakistan"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="field"
        />
      </div>

      {destination.trim().length >= 3 && (
        <div className="relative h-40 overflow-hidden rounded-xl bg-surface-2">
          <Photo src={preview} alt={`Photo of ${destination}`} className="h-full w-full" />
          <div className="img-scrim absolute inset-0" />
          <p className="absolute bottom-3 left-4 flex items-center gap-1.5 text-sm font-semibold text-white">
            <MapPin size={15} /> {destination}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="departureCity" className="label">
          Departure city
        </label>
        <input
          id="departureCity"
          name="departureCity"
          maxLength={100}
          placeholder="e.g. Lahore (helps plan transport)"
          className="field"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="travelers" className="label">
            Travellers *
          </label>
          <input
            id="travelers"
            name="travelers"
            type="number"
            required
            min={1}
            max={30}
            defaultValue={2}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="durationDays" className="label">
            Trip length (days) *
          </label>
          <input
            id="durationDays"
            name="durationDays"
            type="number"
            required
            min={1}
            max={30}
            defaultValue={8}
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="label">
          Total group budget (PKR, optional)
        </label>
        <input
          id="budget"
          name="budget"
          type="number"
          min={1}
          max={1000000000}
          placeholder="e.g. 250000"
          className="field"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="travelStyle" className="label">
            Travel style
          </label>
          <select
            id="travelStyle"
            name="travelStyle"
            defaultValue="budget"
            className="field"
          >
            <option value="budget">Budget friendly</option>
            <option value="comfortable">Comfortable</option>
            <option value="luxury">Premium / luxury</option>
            <option value="adventure">Adventure</option>
            <option value="family">Family-friendly</option>
          </select>
        </div>
        <div>
          <label htmlFor="transportPreference" className="label">
            Transport
          </label>
          <select
            id="transportPreference"
            name="transportPreference"
            defaultValue="not-decided"
            className="field"
          >
            <option value="include-transport">Include transport planning</option>
            <option value="own-vehicle">Own vehicle</option>
            <option value="public-transport">Public transport</option>
            <option value="not-decided">Not decided</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="preferences" className="label">
          What matters to you? (optional)
        </label>
        <textarea
          id="preferences"
          name="preferences"
          rows={4}
          maxLength={2000}
          placeholder="e.g. affordable hostels, lakes, local food, gentle walks, avoid long hikes"
          className="field"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300/60 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full min-h-12">
        {loading ? <><Loader2 size={17} className="animate-spin" /> Researching and building your itinerary…</> : "Create my trip plan"}
      </button>
      <p className="text-xs leading-5 text-muted">
        Your plan is a starting point. Search results do not guarantee current prices,
        room availability, road access, visa eligibility, or bookings.
      </p>
    </form>
  );
}


"use client";

import { useState } from "react";

type PackageOption = {
  slug: string;
  title: string;
  destinationName: string;
  durationDays: number;
};

type BookingFormProps = {
  packages: PackageOption[];
  initialPackageSlug: string;
};

export default function BookingForm({
  packages,
  initialPackageSlug,
}: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reference, setReference] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    travelers: "2",
    startDate: "",
    packageSlug: initialPackageSlug,
    specialRequests: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    setReference("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          travelers: Number(form.travelers),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to submit your request.");
        return;
      }

      setSuccess(result.message);
      setReference(result.booking.reference);

      setForm((previous) => ({
        ...previous,
        customerName: "",
        email: "",
        phone: "",
        travelers: "2",
        startDate: "",
        specialRequests: "",
      }));
    } catch {
      setError(
        "Unable to reach the server. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-6 md:p-9">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-300/60 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-accent/30 bg-accent-soft p-4 text-sm"
          >
            <p className="font-semibold">{success}</p>
            <p className="mt-2 break-all">
              Reference: {reference}
            </p>
            <p className="mt-2">
              Your request is pending review. This is not a confirmed booking.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="customerName"
            className="label"
          >
            Full name *
          </label>
          <input
            id="customerName"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            value={form.customerName}
            onChange={(e) => updateField("customerName", e.target.value)}
            className="field"
            placeholder="Enter your full name"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="label"
            >
              Email address *
            </label>
            <input
              id="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="label"
            >
              Phone number *
            </label>
            <input
              id="phone"
              type="tel"
              required
              minLength={7}
              maxLength={30}
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="field"
              placeholder="+92 ..."
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="packageSlug"
              className="label"
            >
              Tour package
            </label>
            <select
              id="packageSlug"
              value={form.packageSlug}
              onChange={(e) => updateField("packageSlug", e.target.value)}
              className="field"
            >
              <option value="">Help me choose a tour</option>
              {packages.map((tour) => (
                <option key={tour.slug} value={tour.slug}>
                  {tour.title} — {tour.durationDays} days
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="travelers"
              className="label"
            >
              Number of travelers *
            </label>
            <select
              id="travelers"
              required
              value={form.travelers}
              onChange={(e) => updateField("travelers", e.target.value)}
              className="field"
            >
              {Array.from({ length: 30 }, (_, index) => index + 1).map(
                (count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? "traveler" : "travelers"}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="label"
          >
            Preferred travel date
          </label>
          <input
            id="startDate"
            type="date"
            min={new Date().toLocaleDateString("en-CA")}
            value={form.startDate}
            onChange={(e) => updateField("startDate", e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label
            htmlFor="specialRequests"
            className="label"
          >
            Special requests
          </label>
          <textarea
            id="specialRequests"
            rows={4}
            maxLength={2000}
            value={form.specialRequests}
            onChange={(e) => updateField("specialRequests", e.target.value)}
            className="field"
            placeholder="Tell us about your preferences, transport, accommodation, or other requirements."
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full min-h-12">
          {submitting ? "Submitting request…" : "Request a quotation"}
        </button>

        <p className="text-xs leading-6 text-muted">
          Submitting this form sends a quotation request. Prices,
          availability, and booking confirmation will be handled separately.
        </p>
      </form>
    </div>
  );
}

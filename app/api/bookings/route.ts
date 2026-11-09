
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bookingSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  travelers: z.number().int().min(1).max(30),
  startDate: z.string().optional(),
  specialRequests: z.string().max(2000).optional(),
  packageSlug: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please check your booking details and try again." },
        { status: 400 },
      );
    }

    const data = result.data;

    let startDate: Date | null = null;

    if (data.startDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
        return NextResponse.json(
          { error: "Please provide a valid travel date." },
          { status: 400 },
        );
      }

      startDate = new Date(`${data.startDate}T00:00:00.000Z`);

      if (
        Number.isNaN(startDate.getTime()) ||
        startDate.toISOString().slice(0, 10) !== data.startDate
      ) {
        return NextResponse.json(
          { error: "Please provide a valid travel date." },
          { status: 400 },
        );
      }
    }

    let tourPackageId: string | null = null;

    if (data.packageSlug) {
      const tourPackage = await prisma.tourPackage.findFirst({
        where: {
          slug: data.packageSlug,
          isActive: true,
        },
        select: { id: true },
      });

      if (!tourPackage) {
        return NextResponse.json(
          { error: "The selected tour package is unavailable." },
          { status: 400 },
        );
      }

      tourPackageId = tourPackage.id;
    }

    const booking = await prisma.bookingRequest.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        travelers: data.travelers,
        startDate,
        specialRequests: data.specialRequests?.trim() || null,
        tourPackageId,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message:
          "Your quotation request has been submitted successfully.",
        booking: {
          reference: booking.id,
          status: booking.status,
          createdAt: booking.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking submission failed:", error);

    return NextResponse.json(
      { error: "We couldn't submit your request. Please try again." },
      { status: 500 },
    );
  }
}

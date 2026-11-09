import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-session";
import { getPlaceImage } from "@/lib/place-images";
import AdminBookings from "./AdminBookings";

export const instant = false;

export default async function AdminPage() {
  await connection();
  await requireAdminSession();

  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { tourPackage: { include: { destination: { select: { name: true, imageUrl: true } } } } },
  });

  // One photo per destination, matched by name.
  const names = [...new Set(bookings.map((b) => b.tourPackage?.destination.name).filter((n): n is string => !!n))];
  const photoEntries = await Promise.all(
    names.map(async (name) => {
      const stored = bookings.find((b) => b.tourPackage?.destination.name === name)?.tourPackage?.destination.imageUrl;
      return [name, stored || (await getPlaceImage(name, 200))] as const;
    }),
  );
  const photos = Object.fromEntries(photoEntries);

  const serializedBookings = bookings.map((booking) => ({
    id: booking.id, customerName: booking.customerName, email: booking.email, phone: booking.phone,
    travelers: booking.travelers, startDate: booking.startDate?.toISOString() ?? null,
    specialRequests: booking.specialRequests, status: booking.status,
    quotedPrice: booking.quotedPrice?.toString() ?? null, currency: booking.currency,
    adminNotes: booking.adminNotes, createdAt: booking.createdAt.toISOString(),
    packageTitle: booking.tourPackage?.title ?? null,
    destinationName: booking.tourPackage?.destination.name ?? null,
    photo: booking.tourPackage ? photos[booking.tourPackage.destination.name] ?? null : null,
  }));

  return <AdminBookings bookings={serializedBookings} />;
}

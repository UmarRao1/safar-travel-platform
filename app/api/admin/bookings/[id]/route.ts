import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/admin-session";

const updateSchema = z.object({
  status: z.enum(["PENDING", "QUOTED", "CONFIRMED", "CANCELLED"]),
  quotedPrice: z.union([z.string(), z.number()]).nullable().optional(),
  currency: z.enum(["PKR", "USD", "SAR", "GBP", "EUR"]).optional(),
  adminNotes: z.string().max(4000).nullable().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the status, quote amount, currency and notes." }, { status: 400 });
  }

  const { id } = await context.params;
  const data = parsed.data;
  let quotedPrice: string | null | undefined;

  if (data.quotedPrice !== undefined) {
    if (data.quotedPrice === null || String(data.quotedPrice).trim() === "") {
      quotedPrice = null;
    } else {
      const amount = Number(data.quotedPrice);
      if (!Number.isFinite(amount) || amount < 0 || amount > 9999999999.99) {
        return NextResponse.json({ error: "Quote must be a valid non-negative amount." }, { status: 400 });
      }
      quotedPrice = amount.toFixed(2);
    }
  }

  if (data.status === "QUOTED" && (quotedPrice === undefined || quotedPrice === null)) {
    const current = await prisma.bookingRequest.findUnique({ where: { id }, select: { quotedPrice: true } });
    if (!current?.quotedPrice) {
      return NextResponse.json({ error: "Enter a quote amount before setting status to QUOTED." }, { status: 400 });
    }
  }

  try {
    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: {
        status: data.status,
        ...(quotedPrice !== undefined ? { quotedPrice } : {}),
        ...(data.currency ? { currency: data.currency } : {}),
        ...(data.adminNotes !== undefined ? { adminNotes: data.adminNotes?.trim() || null } : {}),
      },
      select: { id: true, status: true, quotedPrice: true, currency: true, adminNotes: true, updatedAt: true },
    });
    return NextResponse.json({
      booking: { ...updated, quotedPrice: updated.quotedPrice?.toString() ?? null, updatedAt: updated.updatedAt.toISOString() },
    });
  } catch (error) {
    console.error("Admin booking update failed:", error);
    return NextResponse.json({ error: "Booking not found or could not be updated." }, { status: 404 });
  }
}

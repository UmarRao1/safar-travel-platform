import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  adminSessionCookieOptions,
  createAdminSessionToken,
} from "@/lib/admin-session";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

function constantTimeTextEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a.trim().toLowerCase(), "utf8");
  const bBuffer = Buffer.from(b.trim().toLowerCase(), "utf8");

  return (
    aBuffer.length === bBuffer.length &&
    timingSafeEqual(aBuffer, bBuffer)
  );
}

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address and password." },
      { status: 400 },
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim();

  // Next.js may interpret dollar signs in .env values as variable
  // references. Restore escaped dollar signs if they are present.
  const rawPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const passwordHash = rawPasswordHash?.replace(/\\\$/g, "$");

  if (process.env.NODE_ENV !== "production") {
    console.info("Safar runtime hash check:", {
      hashPresent: Boolean(passwordHash),
      hashLength: passwordHash?.length ?? 0,
      bcryptFormatValid: /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(
        passwordHash ?? "",
      ),
      startsWithBcryptPrefix: /^\$2[aby]\$/.test(passwordHash ?? ""),
      containsBackslashes: passwordHash?.includes("\\") ?? false,
    });
  }

  const secret = process.env.ADMIN_SESSION_SECRET;

  if (
    !adminEmail ||
    !passwordHash ||
    !secret ||
    secret.length < 32
  ) {
    return NextResponse.json(
      {
        error:
          "Admin sign-in is not configured. Check the three admin environment variables in .env, then restart the development server.",
      },
      { status: 503 },
    );
  }

  let passwordMatches = false;

  try {
    passwordMatches = await bcrypt.compare(
      parsed.data.password,
      passwordHash,
    );
  } catch (error) {
    console.error(
      "Safar admin password-hash verification failed:",
      error,
    );
  }

  const emailMatches = constantTimeTextEqual(
    parsed.data.email,
    adminEmail,
  );

  if (process.env.NODE_ENV !== "production") {
    console.info("Safar admin login diagnostic:", {
      emailMatches,
      passwordMatches,
    });
  }

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json(
      {
        error:
          "Invalid email or password. Check your admin email and try again.",
      },
      { status: 401 },
    );
  }

  try {
    const response = NextResponse.json({ message: "Signed in." });

    response.cookies.set(
      ADMIN_COOKIE_NAME,
      createAdminSessionToken(),
      adminSessionCookieOptions,
    );

    return response;
  } catch (error) {
    console.error("Safar admin session creation failed:", error);

    return NextResponse.json(
      {
        error:
          "Could not create an admin session. Check the server configuration.",
      },
      { status: 503 },
    );
  }
}
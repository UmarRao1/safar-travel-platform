import { NextResponse } from "next/server";
import { getPlaceImage } from "@/lib/place-images";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3 || q.length > 100) {
    return NextResponse.json({ error: "Enter a place name." }, { status: 400 });
  }
  const url = await getPlaceImage(q, 1200);
  return NextResponse.json({ url }, { headers: { "Cache-Control": "public, max-age=3600" } });
}

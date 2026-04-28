import { NextResponse } from "next/server";
import { getSiteStats } from "@/lib/stats";

export const revalidate = 60;

export async function GET() {
  const stats = await getSiteStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

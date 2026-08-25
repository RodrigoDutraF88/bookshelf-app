import { NextResponse } from "next/server";

import { db } from "~/server/db";

// Supabase pauses free-tier projects after 7 days without database activity.
// This runs a real query, which a static page hit would not.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.book.count();

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Only ever logged, never returned: driver errors carry the database host
    // and port, and this route is public.
    console.error("[keep-alive] database ping failed", error);

    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

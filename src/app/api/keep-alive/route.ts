import { NextResponse } from "next/server";

import { db } from "~/server/db";

// Supabase pauses free-tier projects after 7 days without database activity.
// This runs a real query, which a static page hit would not.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const books = await db.book.count();

    return NextResponse.json({ ok: true, books });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

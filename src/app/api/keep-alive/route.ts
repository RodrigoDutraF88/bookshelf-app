import { NextResponse } from "next/server";

import { db } from "~/server/db";

/**
 * Keep-alive endpoint for the Supabase free tier, which pauses a project after
 * 7 days without database activity. Pinging this route runs a real query
 * against Postgres, which counts as activity (unlike a static page hit).
 */
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

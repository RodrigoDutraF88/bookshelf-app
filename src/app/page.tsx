// src/app/library/page.tsx
//
// Next.js App Router page for the library.
//
// This is a SERVER Component — it handles:
// - Session check (redirect to sign-in if not authenticated)
// - Page metadata
// - Renders the LibraryView Client Component
//
// The data fetching happens inside LibraryView via tRPC hooks,
// not here, because the filter/search state is client-side.
// We could prefetch here with HydrateClient for faster first paint,
// but that's an optimization to add once the UI is working correctly.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { LibraryView } from "~/components/library/LibraryView";

export const metadata: Metadata = {
  title: "My Library — Bookshelf",
  description: "Your personal reading collection",
};

export default async function LibraryPage() {
  const session = await auth();

  // Redirect unauthenticated users to sign-in
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* 
        Max-width container with responsive horizontal padding.
        Matches the sidebar layout used in the app shell (to be built
        in feat/library-ui step 2 when you add the nav sidebar).
      */}
      <div
        className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8"
        style={{ maxWidth: "1280px" }}
      >
        <LibraryView />
      </div>
    </main>
  );
}
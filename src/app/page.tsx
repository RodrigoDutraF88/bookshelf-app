// Next.js App Router page for the library.
// This is a SERVER Component it handles: Session check Page metadata Renders the LibraryView Client Component

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

      <div
        className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8"
        style={{ maxWidth: "1280px" }}
      >
        <LibraryView />
      </div>
    </main>
  );
}
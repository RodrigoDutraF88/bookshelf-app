// src/app/library/page.tsx
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
  if (!session?.user) redirect("/login");

  return (
    <main
      style={{
        minHeight: "100dvh",
        backgroundColor: "var(--color-bg)",
        padding: "40px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        <LibraryView />
      </div>
    </main>
  );
}
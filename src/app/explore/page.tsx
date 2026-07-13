import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { ExploreView } from "~/components/explore/ExploreView";

export const metadata: Metadata = {
  title: "Explore Books — Bookshelf",
  description: "Search and discover books to add to your library",
};

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main style={{ minHeight: "100dvh", backgroundColor: "var(--color-bg)" }}>
      <ExploreView />
    </main>
  );
}
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { ReviewsView } from "./ReviewsView";

export const metadata: Metadata = {
  title: "My Reviews — Bookshelf",
  description: "Your personal book reviews and ratings",
};

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  return (
    <main
      style={{
        minHeight: "100dvh",
        backgroundColor: "var(--color-bg)",
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        <ReviewsView />
      </div>
    </main>
  );
}
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { ReviewsView } from "./ReviewsView";

export const metadata = {
  title: "My Reviews — Bookshelf",
};

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main style={{ minHeight: "100dvh", backgroundColor: "var(--color-bg)", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <ReviewsView />
      </div>
    </main>
  );
}
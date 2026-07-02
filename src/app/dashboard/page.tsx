import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
//import { DashboardView } from "~/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard — Bookshelf",
  description: "Your reading stats and activity",
};

export default async function DashboardPage() {
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
        {/* <DashboardView /> */}
      </div>
    </main>
  );
}
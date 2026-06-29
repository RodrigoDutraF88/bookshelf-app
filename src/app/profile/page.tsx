import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { ProfileView } from "./ProfileView";

export const metadata = { title: "Profile — Bookshelf" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main style={{ minHeight: "100dvh", backgroundColor: "var(--color-bg)", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <ProfileView user={session.user} />
      </div>
    </main>
  );
}
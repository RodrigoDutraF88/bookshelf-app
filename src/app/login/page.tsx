import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { LoginView } from "~/components/auth/LoginView";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/library");
  return <LoginView />;
}
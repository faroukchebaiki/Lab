import { redirect } from "next/navigation";

import { auth } from "@/lib/neon-auth-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  redirect("/auth/sign-in");
}

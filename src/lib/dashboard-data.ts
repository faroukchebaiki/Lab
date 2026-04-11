import { redirect } from "next/navigation";

import { safeGetSession } from "@/lib/neon-auth-server";

export async function requireDashboardUser() {
  const { data: session } = await safeGetSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return {
    session,
    username: session.user.name || session.user.email,
  };
}

import { redirect } from "next/navigation";

import { safeGetSession } from "@/lib/neon-auth-server";
import { getUserProfileSettings } from "@/lib/user-settings";

export async function requireDashboardUser() {
  const { data: session } = await safeGetSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const settings = await getUserProfileSettings(session.user.id);

  return {
    session,
    username: session.user.name || session.user.email,
    settings,
  };
}

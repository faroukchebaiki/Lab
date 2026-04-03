import { DashboardShell } from "@/components/dashboard-shell";
import { redirect } from "next/navigation";

import { auth } from "@/lib/neon-auth-server";
import { readReports } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const tokenResult = await auth.token().catch(() => null);
  const accessToken =
    typeof tokenResult?.data?.token === "string" ? tokenResult.data.token : null;
  const reports = await readReports({ accessToken });

  return (
    <DashboardShell
      reports={reports}
      username={session.user.name || session.user.email}
    />
  );
}

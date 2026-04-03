import { DashboardShell } from "@/components/dashboard-shell";
import { redirect } from "next/navigation";

import { safeGetSession, safeGetToken } from "@/lib/neon-auth-server";
import { type ReportRecord } from "@/lib/report-schema";
import { readReports } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: session } = await safeGetSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const tokenResult = await safeGetToken();
  const accessToken =
    typeof tokenResult?.data?.token === "string" ? tokenResult.data.token : null;
  let reportsError: string | null = null;
  let reports: ReportRecord[] = [];

  try {
    reports = await readReports({ accessToken });
  } catch (error) {
    reportsError =
      error instanceof Error
        ? error.message
        : "Unable to load reports from Neon right now.";
  }

  return (
    <DashboardShell
      reports={reports}
      reportsError={reportsError}
      username={session.user.name || session.user.email}
    />
  );
}

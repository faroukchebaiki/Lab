import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/lib/auth";
import { readReports } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const reports = await readReports();

  return <DashboardShell reports={reports} username={session.username} />;
}

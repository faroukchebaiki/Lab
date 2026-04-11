import { DashboardShell } from "@/components/dashboard-shell";
import { requireDashboardUser } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { username } = await requireDashboardUser();

  return (
    <DashboardShell
      pageTitle="Laboratory Reports"
      pageDescription="Organize report workflows by unit, keep forms separated, and build new report types on a stable base."
      username={username}
    >
      {children}
    </DashboardShell>
  );
}

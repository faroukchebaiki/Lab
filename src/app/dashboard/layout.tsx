import { DashboardShell } from "@/components/dashboard-shell";
import { requireDashboardUser } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { username, settings } = await requireDashboardUser();

  return (
    <DashboardShell
      username={username}
      occupation={settings.occupation}
    >
      {children}
    </DashboardShell>
  );
}

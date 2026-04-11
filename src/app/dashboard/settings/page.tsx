import { SettingsForm } from "@/components/settings/settings-form";
import { requireDashboardUser } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { session, settings } = await requireDashboardUser();

  return (
    <div className="space-y-6">
      <SettingsForm
        currentEmail={session.user.email}
        currentName={session.user.name || session.user.email}
        settings={settings}
      />
    </div>
  );
}

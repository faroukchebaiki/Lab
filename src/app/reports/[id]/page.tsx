import { notFound, redirect } from "next/navigation";

import { ReportActions } from "@/components/reports/report-actions";
import { ReportSheet } from "@/components/reports/report-sheet";
import { auth } from "@/lib/neon-auth-server";
import { getReportById } from "@/lib/storage";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: ReportPageProps) {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const tokenResult = await auth.token().catch(() => null);
  const accessToken =
    typeof tokenResult?.data?.token === "string" ? tokenResult.data.token : null;
  const { id } = await params;
  const report = await getReportById(id, { accessToken });

  if (!report) {
    notFound();
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="no-print flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/88 p-6 shadow-[0_22px_70px_rgba(34,48,28,0.12)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {report.sectionTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {report.meta.reportDate} • Saved by {report.createdBy}
            </p>
          </div>
          <ReportActions
            targetId="report-sheet"
            fileName={`${report.sectionTitle.toLowerCase().replace(/\s+/g, "-")}-${report.meta.reportDate}.pdf`}
          />
        </div>

        <div className="overflow-x-auto pb-6">
          <ReportSheet report={report} />
        </div>
      </div>
    </main>
  );
}

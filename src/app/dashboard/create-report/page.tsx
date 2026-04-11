import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Flame,
  FlaskConical,
  Layers3,
  PackageSearch,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDashboardUser } from "@/lib/dashboard-data";
import { safeGetToken } from "@/lib/neon-auth-server";
import { type ReportRecord } from "@/lib/report-schema";
import { readReports } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const outlineLinkClassName =
  "inline-flex h-8 w-fit shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const reportSections = [
  {
    href: "/dashboard/vertical-kiln-reports",
    title: "Vertical Kiln Reports",
    description: "Create the base flow for vertical kiln control sheets and readings.",
    icon: Flame,
  },
  {
    href: "/dashboard/horizontal-kiln-reports",
    title: "Horizontale Kiln Reports",
    description: "Use the existing CAO horizontal form and grow this section with more kiln sheets.",
    icon: FlaskConical,
  },
  {
    href: "/dashboard/hydration-unit-reports",
    title: "Hydration Unit Reports",
    description: "Keep hydration checks, density tracking, and particle-size entries together.",
    icon: Layers3,
  },
  {
    href: "/dashboard/other-reports",
    title: "Other Reports",
    description: "Store one-off report templates and future lab workflows in one place.",
    icon: PackageSearch,
  },
] as const;

function formatReportType(type: ReportRecord["type"]) {
  return type === "cao-horizontal" ? "CAO Horizontal" : "Hydration";
}

export default async function CreateReportPage() {
  await requireDashboardUser();

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

  let caoCount = 0;
  let hydrationCount = 0;

  for (const report of reports) {
    if (report.type === "cao-horizontal") {
      caoCount += 1;
    } else {
      hydrationCount += 1;
    }
  }

  const latestReport = reports[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{reports.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Stored and ready to open or print.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CAO / Hydration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {caoCount} / {hydrationCount}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Current live forms already connected to storage.
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Save</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {latestReport
                ? formatDistanceToNow(new Date(latestReport.createdAt), {
                    addSuffix: true,
                  })
                : "No reports yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {latestReport
                ? `${formatReportType(latestReport.type)} • ${format(
                    new Date(latestReport.createdAt),
                    "dd MMM yyyy, HH:mm"
                  )}`
                : "Your first saved report will appear here."}
            </p>
          </CardContent>
        </Card>
      </section>

      {reportsError ? (
        <Card className="border-amber-400/60 bg-amber-50 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
          <CardContent className="pt-6 text-sm leading-6">
            {reportsError}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {reportSections.map((section) => (
          <Card key={section.href} className="border-border/80 bg-card/95">
            <CardHeader className="space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
                <section.icon className="size-5" />
              </div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {section.description}
              </p>
              <Link
                href={section.href}
                className={cn(outlineLinkClassName)}
              >
                Open Section
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="saved-reports">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Saved Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No reports saved yet.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {formatReportType(report.type)}
                        </Badge>
                        <Badge variant="secondary">
                          {report.meta.reportDate}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-medium">{report.sectionTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          Saved by {report.createdBy} •{" "}
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/reports/${report.id}`}
                      className={outlineLinkClassName}
                    >
                      Open Report
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

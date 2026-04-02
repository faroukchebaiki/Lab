"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  FileSpreadsheet,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

import { CaoHorizontalForm } from "@/components/reports/cao-horizontal-form";
import { HydrationForm } from "@/components/reports/hydration-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ReportRecord } from "@/lib/report-schema";

type DashboardShellProps = {
  reports: ReportRecord[];
  username: string;
};

function formatReportType(type: ReportRecord["type"]) {
  return type === "cao-horizontal" ? "CAO Horizontal" : "Hydration";
}

export function DashboardShell({ reports, username }: DashboardShellProps) {
  const router = useRouter();

  const caoCount = reports.filter((report) => report.type === "cao-horizontal").length;
  const hydrationCount = reports.filter(
    (report) => report.type === "hydration"
  ).length;

  const latestReport = reports[0];

  async function logout() {
    const response = await fetch("/api/logout", {
      method: "POST",
    });

    if (!response.ok) {
      toast.error("Unable to log out.");
      return;
    }

    toast.success("Logged out.");
    router.push("/");
    router.refresh();
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="app-shell mx-auto max-w-7xl rounded-[2rem] border border-white/70 p-5 shadow-[0_24px_80px_rgba(54,74,44,0.14)] sm:p-8">
        <header className="no-print flex flex-col gap-6 border-b border-border/80 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full bg-primary/10 px-4 py-1 text-primary hover:bg-primary/10">
              <LayoutDashboard className="mr-2 size-4" />
              Flash Journal Dashboard
            </Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                Welcome back, {username}
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
                Create daily lab reports, keep every result archived, and open a
                print-ready PDF sheet whenever you need it.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={logout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="border-border/80 bg-white/88">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Total Reports</CardTitle>
              <FileSpreadsheet className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-4xl font-semibold">{reports.length}</p>
              <p className="text-sm text-muted-foreground">
                Archived and ready for future lookup.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white/88">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">CAO / Hydration</CardTitle>
              <FlaskConical className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-4xl font-semibold">
                {caoCount} / {hydrationCount}
              </p>
              <p className="text-sm text-muted-foreground">
                Split by the two report formats from your workflow.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white/88">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Latest Save</CardTitle>
              <Printer className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xl font-semibold">
                {latestReport
                  ? formatDistanceToNow(new Date(latestReport.createdAt), {
                      addSuffix: true,
                    })
                  : "No reports yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {latestReport
                  ? `${formatReportType(latestReport.type)} • ${format(
                      new Date(latestReport.createdAt),
                      "dd MMM yyyy, HH:mm"
                    )}`
                  : "Create the first report below."}
              </p>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="create" className="mt-8 gap-6">
          <TabsList className="no-print">
            <TabsTrigger value="create">Create Reports</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Tabs defaultValue="cao-horizontal" className="gap-6">
              <TabsList className="no-print">
                <TabsTrigger value="cao-horizontal">CAO Horizontal</TabsTrigger>
                <TabsTrigger value="hydration">Hydration</TabsTrigger>
              </TabsList>
              <TabsContent value="cao-horizontal">
                <CaoHorizontalForm />
              </TabsContent>
              <TabsContent value="hydration">
                <HydrationForm />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="saved">
            <Card className="border-border/80 bg-white/92">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Saved Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
                    No reports saved yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/25 p-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {formatReportType(report.type)}
                            </Badge>
                            <Badge variant="secondary">
                              {report.meta.reportDate}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {report.sectionTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Saved by {report.createdBy} •{" "}
                              {formatDistanceToNow(new Date(report.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/reports/${report.id}`}
                            className={buttonVariants({ variant: "outline" })}
                          >
                            Open Report
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

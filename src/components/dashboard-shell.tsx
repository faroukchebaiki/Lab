"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  FileSpreadsheet,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  MoonStar,
  Printer,
  SunMedium,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { CaoHorizontalForm } from "@/components/reports/cao-horizontal-form";
import { HydrationForm } from "@/components/reports/hydration-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/neon-auth-client";
import { type ReportRecord } from "@/lib/report-schema";

type DashboardShellProps = {
  reports: ReportRecord[];
  reportsError?: string | null;
  username: string;
};

const navItems = [
  { id: "create", label: "Create Reports", icon: FlaskConical },
  { id: "saved", label: "Saved Reports", icon: FileSpreadsheet },
] as const;

function formatReportType(type: ReportRecord["type"]) {
  return type === "cao-horizontal" ? "CAO Horizontal" : "Hydration";
}

export function DashboardShell({
  reports,
  reportsError = null,
  username,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("create");

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

  async function logout() {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error("Unable to log out.");
      return;
    }

    toast.success("Logged out.");
    router.push("/");
    router.refresh();
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="gap-3 px-3 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <LayoutDashboard className="size-5" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">Lab BMSD chaux</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                Daily reports
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Printable reports"
                    isActive={pathname.startsWith("/reports/")}
                    onClick={() => router.push("/dashboard")}
                  >
                    <Printer />
                    <span>Printable Reports</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-3 pb-4">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{username}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              Neon authenticated
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="flex-1"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {resolvedTheme === "dark" ? (
                <SunMedium className="size-4" />
              ) : (
                <MoonStar className="size-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="flex-1"
              onClick={logout}
            >
              <LogOut className="size-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh">
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Menu className="size-4" />
              </SidebarTrigger>
              <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Laboratory Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Minimal workflow for daily tests and archived reports.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {username}
            </Badge>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{reports.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stored for future access.
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
                  Split across both lab workflows.
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

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="gap-4"
          >
            <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
              <TabsTrigger value="create">Create Reports</TabsTrigger>
              <TabsTrigger value="saved">Saved Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <Tabs defaultValue="cao-horizontal" className="gap-4">
                <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
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
                            className={buttonVariants({ variant: "outline" })}
                          >
                            Open Report
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

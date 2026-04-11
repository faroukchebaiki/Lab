"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FilePlus2,
  FileSpreadsheet,
  Flame,
  FlaskConical,
  Settings,
  LogOut,
  Menu,
  MoonStar,
  PackageSearch,
  Printer,
  SunMedium,
} from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
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
import { authClient } from "@/lib/neon-auth-client";

type DashboardShellProps = {
  children: React.ReactNode;
  username: string;
  occupation: string;
};

const pageCopy = {
  "/dashboard/create-report": {
    title: "Create a Report",
    description:
      "Start a new laboratory report, review saved records, and move into the right reporting section for each unit.",
  },
  "/dashboard/vertical-kiln-reports": {
    title: "Vertical Kiln Reports",
    description:
      "Use this section as the base for vertical kiln process checks, production readings, operator notes, and future printable forms.",
  },
  "/dashboard/horizontal-kiln-reports": {
    title: "Horizontale Kiln Reports",
    description:
      "Create and manage horizontal kiln reports here, including the active CAO workflow and any future kiln monitoring sheets.",
  },
  "/dashboard/hydration-unit-reports": {
    title: "Hydration Unit Reports",
    description:
      "Manage hydration unit measurements, density and fineness tracking, and any added hydration quality-control forms.",
  },
  "/dashboard/other-reports": {
    title: "Other Reports",
    description:
      "Keep flexible lab workflows, custom report templates, and one-off quality documents together in one section.",
  },
  "/dashboard/settings": {
    title: "Settings",
    description:
      "Update your account details, change your email or password, and manage profile information like birthday, occupation, department, phone, location, and bio.",
  },
} as const;

const defaultPageCopy = {
  title: "Laboratory Reports",
  description:
    "Organize report workflows by unit, keep forms separated, and build new report types on a stable base.",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    return {
      href,
      label: segment.replace(/-/g, " "),
    };
  });
}

const navItems = [
  {
    href: "/dashboard/create-report",
    label: "Create a Report",
    icon: FilePlus2,
  },
  {
    href: "/dashboard/vertical-kiln-reports",
    label: "Vertical Kiln Reports",
    icon: Flame,
  },
  {
    href: "/dashboard/horizontal-kiln-reports",
    label: "Horizontale Kiln Reports",
    icon: FlaskConical,
  },
  {
    href: "/dashboard/hydration-unit-reports",
    label: "Hydration Unit Reports",
    icon: FileSpreadsheet,
  },
  {
    href: "/dashboard/other-reports",
    label: "Other Reports",
    icon: PackageSearch,
  },
] as const;

const quickLinks = [
  {
    href: "/dashboard/create-report#saved-reports",
    label: "Saved Reports",
    icon: FileSpreadsheet,
  },
  {
    href: "/dashboard/create-report#saved-reports",
    label: "Printable Reports",
    icon: Printer,
  },
] as const;

export function DashboardShell({
  children,
  username,
  occupation,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const currentPageCopy =
    pageCopy[pathname as keyof typeof pageCopy] ?? defaultPageCopy;
  const breadcrumbs = getBreadcrumbs(pathname);

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
            <div className="flex h-11 w-16 items-center justify-center rounded-lg bg-white/80 p-1 shadow-sm ring-1 ring-sidebar-border/60">
              <Image
                src="/chaux-bmsd-logo.png"
                alt="Chaux BMSD logo"
                width={120}
                height={65}
                className="h-auto w-full object-contain"
                priority
              />
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
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={pathname === item.href}
                      render={<Link href={item.href} />}
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
                {quickLinks.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={pathname === "/dashboard/create-report"}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-3 pb-4">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{username}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              {occupation || "Chemical Industrial Engineer"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="flex-1"
              onClick={() => router.push("/dashboard/settings")}
              aria-label="Open settings"
            >
              <Settings className="size-4" />
              <span className="sr-only">Settings</span>
            </Button>
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
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 sm:p-5">
          <header className="flex items-start gap-2">
            <SidebarTrigger className="md:hidden">
              <Menu className="size-4" />
            </SidebarTrigger>
            <div>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                {currentPageCopy.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentPageCopy.description}
              </p>
            </div>
          </header>

          <div className="sticky top-0 z-20 -mx-4 border-y border-border/70 bg-background/95 px-4 py-1.5 backdrop-blur sm:-mx-5 sm:px-5">
            <div className="flex flex-wrap items-center gap-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-1">
                  {index > 0 ? <span>&gt;</span> : null}
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

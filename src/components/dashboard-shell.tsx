"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FilePlus2,
  FileSpreadsheet,
  Flame,
  FlaskConical,
  LogOut,
  Menu,
  MoonStar,
  PackageSearch,
  Printer,
  SunMedium,
} from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
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
  pageTitle: string;
  pageDescription: string;
  username: string;
};

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
  pageTitle,
  pageDescription,
  username,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

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
                  {pageTitle}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {pageDescription}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {username}
            </Badge>
          </header>

          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

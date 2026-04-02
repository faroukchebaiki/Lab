"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Beaker, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const payload = {
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = data.error ?? "Login failed.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Login successful.");
      router.push(redirectTo);
      router.refresh();
    } catch {
      const message = "Unable to reach the server.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,150,101,0.24),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(163,185,93,0.18),transparent_18%)]" />
      <div className="app-shell relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_30px_100px_rgba(61,83,43,0.18)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden min-h-[700px] flex-col justify-between border-r border-border/70 p-10 lg:flex">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary">
              <Beaker className="size-4" />
              Laboratory Digital Journal
            </div>
            <div className="space-y-4">
              <h1 className="max-w-lg text-5xl font-semibold leading-tight tracking-tight text-foreground">
                Flash reports, durable history, and printable sheets in one place.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                Sign in to create laboratory test sheets, keep them for months or
                years, and export clean PDF pages that match your daily reporting
                workflow.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Secure cookie login for the lab team",
              "Durable storage ready for Vercel deployment",
              "A4 print layout for PDF download and archive",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border/80 bg-white/75 p-4 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[700px] items-center justify-center p-6 sm:p-10">
          <Card className="w-full max-w-md border-border/80 bg-white/92 shadow-xl">
            <CardHeader className="space-y-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LockKeyhole className="size-7" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-semibold tracking-tight">
                  Lab Login
                </CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  Use the credentials from your Vercel environment variables or
                  local `.env.local` file.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      placeholder="admin"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {error ? (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" className="h-11 w-full" disabled={pending}>
                  {pending ? "Signing in..." : "Open Dashboard"}
                </Button>

                <p className="text-center text-xs leading-5 text-muted-foreground">
                  Default local credentials are `admin` / `lab2026` until you
                  change them.
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

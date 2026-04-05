"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/neon-auth-client";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (error) {
      toast.error(error.message || "Unable to sign in.");
      setPending(false);
      return;
    }

    toast.success("Signed in.");
    router.push("/dashboard");
    router.refresh();
    setPending(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Lab BMSD chaux
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Laboratory Access
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? (
            <SunMedium className="size-4" />
          ) : (
            <MoonStar className="size-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <Card className="border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email and password to open the lab dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="lab@example.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Signing in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center justify-between gap-2 px-1 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
        <p>
          Coded by{" "}
          <a
            href="https://www.farouk.uk"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Farouk
          </a>
        </p>
        <a
          href="https://www.farouk.uk/privacy"
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoonStar, SunMedium } from "lucide-react";
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
import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/neon-auth-client";
import { cn } from "@/lib/utils";

type AuthMode =
  | "sign-in"
  | "sign-up"
  | "sign-up-success"
  | "forgot-password"
  | "reset-password"
  | "verify-email";
type AuthView = AuthMode;

type LoginFormProps = React.ComponentProps<"div"> & {
  mode?: AuthMode;
  resetToken?: string;
  verifyToken?: string;
};

export function LoginForm({
  mode = "sign-in",
  resetToken = "",
  verifyToken = "",
  className,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<AuthView>(mode);
  const [resetTokenState, setResetTokenState] = useState(resetToken);
  const [verificationEmail, setVerificationEmail] = useState("");
  const verifyAttemptedRef = useRef(false);

  useEffect(() => {
    setView(mode);
  }, [mode]);

  useEffect(() => {
    setResetTokenState(resetToken);
  }, [resetToken]);

  useEffect(() => {
    if (view !== "verify-email" || verifyAttemptedRef.current) {
      return;
    }

    verifyAttemptedRef.current = true;

    if (!verifyToken) {
      toast.error("This verification link is missing its token.");
      router.replace("/auth/sign-in");
      return;
    }

    let cancelled = false;

    async function verifyEmailToken() {
      setPending(true);

      try {
        const { error } = await authClient.verifyEmail({
          query: {
            token: verifyToken,
            callbackURL: "/dashboard",
          },
        });

        if (cancelled) {
          return;
        }

        if (error) {
          toast.error(error.message || "Unable to verify email.");
          router.replace("/auth/sign-in");
          return;
        }

        toast.success("Email verified. You can sign in now.");
        router.replace("/auth/sign-in");
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "Unable to verify email."));
          router.replace("/auth/sign-in");
        }
      } finally {
        if (!cancelled) {
          setPending(false);
        }
      }
    }

    void verifyEmailToken();

    return () => {
      cancelled = true;
    };
  }, [router, verifyToken, view]);

  async function handleSignIn(formData: FormData) {
    setPending(true);

    try {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const response = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      const { error } = response;

      if (error) {
        if (isEmailVerificationError(error.message)) {
          setVerificationEmail(email);
        }
        toast.error(error.message || "Unable to sign in.");
        return;
      }

      toast.success("Signed in.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in."));
    } finally {
      setPending(false);
    }
  }

  async function handleSignUp(formData: FormData) {
    setPending(true);

    try {
      const name = String(formData.get("name") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Unable to create account.");
        return;
      }

      const verificationResponse = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/auth/verify-email`,
      });

      if (verificationResponse.error) {
        setVerificationEmail(email);
        toast.error(
          verificationResponse.error.message ||
            "Account created, but the verification email could not be sent.",
        );
        setView("sign-up-success");
        return;
      }

      setVerificationEmail(email);
      toast.success("Account created. Check your email to verify your account.");
      setView("sign-up-success");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create account."));
    } finally {
      setPending(false);
    }
  }

  async function handleForgotPassword(formData: FormData) {
    setPending(true);

    try {
      const email = String(formData.get("email") ?? "").trim();
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Unable to send reset email.");
        return;
      }

      toast.success("Reset email sent. Check your inbox for the password reset link.");
      router.push("/auth/sign-in");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send reset email."));
    } finally {
      setPending(false);
    }
  }

  async function handleResetPassword(formData: FormData) {
    setPending(true);

    try {
      const newPassword = String(formData.get("password") ?? "");
      const { error } = await authClient.resetPassword({
        newPassword,
        token: resetTokenState,
      });

      if (error) {
        toast.error(error.message || "Unable to reset password.");
        return;
      }

      toast.success("Password reset. You can sign in now.");
      router.push("/auth/sign-in");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reset password."));
    } finally {
      setPending(false);
    }
  }

  async function handleResendVerificationEmail() {
    if (!verificationEmail) {
      toast.error("Enter your email again, then try logging in to resend verification.");
      return;
    }

    setPending(true);

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: verificationEmail,
        callbackURL: `${window.location.origin}/auth/verify-email`,
      });

      if (error) {
        toast.error(error.message || "Unable to resend verification email.");
        return;
      }

      toast.success("Verification email sent.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to resend verification email."));
    } finally {
      setPending(false);
    }
  }

  const heading = view === "sign-up"
    ? "Sign up"
    : view === "sign-up-success"
      ? "Check your email"
    : view === "forgot-password"
        ? "Forgot password"
        : view === "reset-password"
          ? "Reset password"
          : view === "verify-email"
            ? "Verifying email"
          : "Login";

  const description = view === "sign-up"
    ? "Create an account, then verify it from the email Neon sends you."
    : view === "sign-up-success"
      ? "We have sent a confirmation email to your address."
    : view === "forgot-password"
        ? "Enter your email and we will send you a password reset link."
        : view === "reset-password"
          ? "Choose a new password for your account."
          : view === "verify-email"
            ? "We are confirming your email address."
          : "Enter your email and password to open the lab dashboard.";

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
          <CardTitle>{heading}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {view === "sign-in" ? (
            <>
              <form action={handleSignIn}>
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
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Forgot password?
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Sign up
                </Link>
              </div>
              {verificationEmail ? (
                <div className="mt-4 rounded-lg border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                  <p>
                    If your email is not confirmed yet, resend the verification email for{" "}
                    <span className="font-medium text-foreground">{verificationEmail}</span>.
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    className="mt-2 h-auto px-0"
                    disabled={pending}
                    onClick={handleResendVerificationEmail}
                  >
                    Resend verification email
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}

          {view === "sign-up" ? (
            <>
              <form action={handleSignUp}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Lab User"
                      autoComplete="name"
                      required
                    />
                  </Field>
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
                      autoComplete="new-password"
                      required
                    />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending ? "Creating account..." : "Create account"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Login
                </Link>
              </p>
            </>
          ) : null}

          {view === "sign-up-success" ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
                <p>
                  We have sent a confirmation email to{" "}
                  <span className="font-medium text-foreground">
                    {verificationEmail || "your email address"}
                  </span>.
                </p>
                <p className="mt-2">
                  Open that email and click the verification link to activate your
                  account.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={pending || !verificationEmail}
                  onClick={handleResendVerificationEmail}
                >
                  {pending ? "Sending again..." : "Resend confirmation email"}
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => router.push("/auth/sign-in")}
                >
                  Back to login
                </Button>
              </div>
            </div>
          ) : null}

          {view === "forgot-password" ? (
            <>
              <form action={handleForgotPassword}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                    <Input
                      id="forgot-email"
                      name="email"
                      type="email"
                      placeholder="lab@example.com"
                      autoComplete="email"
                      required
                    />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending ? "Sending email..." : "Send reset email"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Login
                </Link>
              </p>
            </>
          ) : null}

          {view === "reset-password" ? (
            <>
              <form action={handleResetPassword}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="new-password">New password</FieldLabel>
                    <Input
                      id="new-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  </Field>
                  {!resetTokenState ? (
                    <p className="text-sm text-destructive">
                      This reset link is missing its token. Open the password reset email again and use that link.
                    </p>
                  ) : null}
                  <Field>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={pending || !resetTokenState}
                    >
                      {pending ? "Resetting password..." : "Reset password"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Need a new code?{" "}
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Send another one
                </Link>
              </p>
            </>
          ) : null}

          {view === "verify-email" ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{pending ? "Verifying your email now..." : "Finishing email verification..."}</p>
              <p>You will be sent back to the login page once this is complete.</p>
            </div>
          ) : null}
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return fallback;
}

function isEmailVerificationError(message?: string) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return normalized.includes("email not confirmed") || normalized.includes("email not verified");
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

type AuthMode = "sign-in" | "sign-up" | "forgot-password";
type AuthView = AuthMode | "verify-email" | "reset-password";

type LoginFormProps = React.ComponentProps<"div"> & {
  mode?: AuthMode;
};

export function LoginForm({
  mode = "sign-in",
  className,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<AuthView>(mode);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    setView(mode);
  }, [mode]);

  async function handleSignIn(formData: FormData) {
    setPending(true);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const response = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    const { error } = response;

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

  async function handleSignUp(formData: FormData) {
    setPending(true);

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
      setPending(false);
      return;
    }

    setVerificationEmail(email);
    setView("verify-email");

    const verificationResponse = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    if (verificationResponse.error) {
      toast.error(verificationResponse.error.message || "Account created, but the verification code could not be sent.");
      setPending(false);
      return;
    }

    toast.success("Account created. Check your email for the verification code.");
    setPending(false);
  }

  async function handleVerifyEmail(formData: FormData) {
    setPending(true);

    const email = String(formData.get("email") ?? "").trim();
    const otp = String(formData.get("otp") ?? "").trim();
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp,
    });

    if (error) {
      toast.error(error.message || "Unable to verify email.");
      setPending(false);
      return;
    }

    toast.success("Email verified. You can sign in now.");
    setView("sign-in");
    setPending(false);
  }

  async function handleResendVerificationCode() {
    setPending(true);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: verificationEmail,
      type: "email-verification",
    });

    if (error) {
      toast.error(error.message || "Unable to resend verification code.");
      setPending(false);
      return;
    }

    toast.success("Verification code sent.");
    setPending(false);
  }

  async function handleForgotPassword(formData: FormData) {
    setPending(true);

    const email = String(formData.get("email") ?? "").trim();
    const { error } = await authClient.forgetPassword.emailOtp({
      email,
    });

    if (error) {
      toast.error(error.message || "Unable to send reset code.");
      setPending(false);
      return;
    }

    setResetEmail(email);
    setView("reset-password");
    toast.success("Reset code sent. Check your email.");
    setPending(false);
  }

  async function handleResetPassword(formData: FormData) {
    setPending(true);

    const email = String(formData.get("email") ?? "").trim();
    const otp = String(formData.get("otp") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    });

    if (error) {
      toast.error(error.message || "Unable to reset password.");
      setPending(false);
      return;
    }

    toast.success("Password reset. You can sign in now.");
    setView("sign-in");
    setPending(false);
  }

  const heading = view === "sign-up"
    ? "Sign up"
    : view === "verify-email"
      ? "Verify email"
      : view === "forgot-password"
        ? "Forgot password"
        : view === "reset-password"
          ? "Reset password"
          : "Login";

  const description = view === "sign-up"
    ? "Create an account, then verify your email with the code we send."
    : view === "verify-email"
      ? "Enter the verification code sent to your email to finish creating your account."
      : view === "forgot-password"
        ? "Enter your email and we will send you a reset code."
        : view === "reset-password"
          ? "Enter the reset code from your email and choose a new password."
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

          {view === "verify-email" ? (
            <>
              <form action={handleVerifyEmail}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="verify-email">Email</FieldLabel>
                    <Input
                      id="verify-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={verificationEmail}
                      onChange={(event) => setVerificationEmail(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="verification-code">Verification code</FieldLabel>
                    <Input
                      id="verification-code"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      required
                    />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending ? "Verifying..." : "Verify email"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={handleResendVerificationCode}
                  disabled={pending || !verificationEmail}
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary disabled:opacity-50"
                >
                  Resend code
                </button>
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Back to login
                </Link>
              </div>
            </>
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
                      {pending ? "Sending code..." : "Send reset code"}
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
                    <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={resetEmail}
                      onChange={(event) => setResetEmail(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="reset-code">Reset code</FieldLabel>
                    <Input
                      id="reset-code"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      required
                    />
                  </Field>
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
                  <Field>
                    <Button type="submit" className="w-full" disabled={pending}>
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

import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";

type AuthPageProps = {
  params: Promise<{
    path?: string[];
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AuthPage({ params, searchParams }: AuthPageProps) {
  const { path } = await params;
  const { token } = await searchParams;
  const authPath = path?.join("/") || "sign-in";

  if (
    authPath !== "sign-in" &&
    authPath !== "sign-up" &&
    authPath !== "forgot-password" &&
    authPath !== "reset-password" &&
    authPath !== "verify-email"
  ) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm">
        <LoginForm mode={authPath} resetToken={token} verifyToken={token} />
      </div>
    </main>
  );
}

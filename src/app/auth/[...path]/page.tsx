import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";

type AuthPageProps = {
  params: Promise<{
    path?: string[];
  }>;
};

export const dynamic = "force-dynamic";

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;
  const authPath = path?.join("/") || "sign-in";

  if (authPath !== "sign-in") {
    redirect("/auth/sign-in");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}

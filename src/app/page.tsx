import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";

type HomePageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

function getRedirectTarget(value?: string | string[]) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate || !candidate.startsWith("/")) {
    return "/dashboard";
  }

  return candidate;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return <LoginForm redirectTo={getRedirectTarget(params.next)} />;
}

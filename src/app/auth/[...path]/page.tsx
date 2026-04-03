import { AuthView } from "@neondatabase/auth/react/ui";

import { AuthProvider } from "@/components/auth-provider";

type AuthPageProps = {
  params: Promise<{
    path?: string[];
  }>;
};

export const dynamic = "force-dynamic";

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;
  const authPath = path?.join("/") || "sign-in";

  return (
    <AuthProvider>
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,150,101,0.24),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(163,185,93,0.18),transparent_18%)]" />
        <div className="app-shell relative flex w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_30px_100px_rgba(61,83,43,0.18)]">
          <section className="hidden min-h-[720px] flex-1 flex-col justify-between border-r border-border/70 p-10 lg:flex">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary">
                Laboratory Digital Journal
              </div>
              <div className="space-y-4">
                <h1 className="max-w-lg text-5xl font-semibold leading-tight tracking-tight text-foreground">
                  Secure Neon login for your lab reports and printable journals.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                  Sign in with Neon Auth to manage laboratory reports, keep them in
                  Neon Postgres, and reopen them later as clean printable sheets.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                "Neon-managed authentication",
                "Reports stored in Neon Postgres",
                "PDF-ready A4 report pages",
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

          <section className="flex min-h-[720px] flex-1 items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <AuthView path={authPath} />
            </div>
          </section>
        </div>
      </main>
    </AuthProvider>
  );
}

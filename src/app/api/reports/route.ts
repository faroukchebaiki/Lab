import { NextResponse } from "next/server";

import { auth } from "@/lib/neon-auth-server";
import { buildReportRecord, reportInputSchema } from "@/lib/report-schema";
import { readReports, saveReport } from "@/lib/storage";

export async function GET() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const tokenResult = await auth.token().catch(() => null);
  const accessToken =
    typeof tokenResult?.data?.token === "string" ? tokenResult.data.token : null;
  const reports = await readReports({ accessToken });

  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = reportInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid report payload.",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const tokenResult = await auth.token().catch(() => null);
  const accessToken =
    typeof tokenResult?.data?.token === "string" ? tokenResult.data.token : null;
  const report = buildReportRecord(parsed.data, session.user.name || session.user.email);
  await saveReport(report, { accessToken });

  return NextResponse.json({ report });
}

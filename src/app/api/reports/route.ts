import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { buildReportRecord, reportInputSchema } from "@/lib/report-schema";
import { readReports, saveReport } from "@/lib/storage";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const reports = await readReports();

  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
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

  const report = buildReportRecord(parsed.data, session.username);
  await saveReport(report);

  return NextResponse.json({ report });
}

import { NextResponse } from "next/server";

import { safeGetSession, safeGetToken } from "@/lib/neon-auth-server";
import { buildReportRecord, reportInputSchema } from "@/lib/report-schema";
import { readReports, saveReport } from "@/lib/storage";

export async function GET() {
  const { data: session } = await safeGetSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const tokenResult = await safeGetToken();
  const accessToken =
    typeof tokenResult?.data?.token === "string" ? tokenResult.data.token : null;
  try {
    const reports = await readReports({ accessToken });

    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load reports from Neon.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { data: session } = await safeGetSession();

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

  const tokenResult = await safeGetToken();
  const accessToken =
    typeof tokenResult?.data?.token === "string" ? tokenResult.data.token : null;
  const report = buildReportRecord(parsed.data, session.user.name || session.user.email);

  try {
    await saveReport(report, { accessToken });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save report to Neon.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ report });
}

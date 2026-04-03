import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import {
  type ReportRecord,
  reportRecordSchema,
  reportStoreSchema,
} from "@/lib/report-schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "flash-journal-records.json");
const DATA_API_URL = process.env.NEON_DATA_API_URL?.replace(/\/$/, "") ?? null;
const DATA_API_KEY = process.env.NEON_DATA_API_KEY ?? null;

type DataApiContext = {
  accessToken?: string | null;
};

type DataApiErrorBody = {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
};

function getAuthHeader(context?: DataApiContext) {
  const token = context?.accessToken ?? DATA_API_KEY;

  if (!token) {
    throw new Error(
      "Missing Neon Data API credentials. Set NEON_DATA_API_KEY or use a signed-in Neon Auth session with access token forwarding."
    );
  }

  return `Bearer ${token}`;
}

async function requestDataApi<T>(
  resource: string,
  init: RequestInit,
  context?: DataApiContext
) {
  if (!DATA_API_URL) {
    return null;
  }

  const response = await fetch(`${DATA_API_URL}/${resource}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: getAuthHeader(context),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (response.ok) {
    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }

  let errorBody: DataApiErrorBody | null = null;

  try {
    errorBody = (await response.json()) as DataApiErrorBody;
  } catch {
    errorBody = null;
  }

  const tableMissing =
    errorBody?.code === "42P01" ||
    /flash_reports/i.test(errorBody?.message ?? "") ||
    /relation .* does not exist/i.test(errorBody?.message ?? "");

  if (tableMissing) {
    throw new Error(
      "The Neon Data API is reachable, but the 'flash_reports' table does not exist yet. Create it in Neon SQL Editor before using the app."
    );
  }

  throw new Error(
    errorBody?.message ||
      `Neon Data API request failed with status ${response.status}.`
  );
}

async function ensureLocalStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ reports: [] }, null, 2), "utf8");
  }
}

async function readLocalReports() {
  await ensureLocalStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = reportStoreSchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    return [];
  }

  return parsed.data.reports.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

async function writeLocalReports(reports: ReportRecord[]) {
  await ensureLocalStore();
  await fs.writeFile(DATA_FILE, JSON.stringify({ reports }, null, 2), "utf8");
}

async function readRemoteReports(context?: DataApiContext) {
  if (!DATA_API_URL) {
    return null;
  }

  const rows = await requestDataApi<{ payload: unknown }[]>(
    "flash_reports?select=payload&order=created_at.desc",
    {
      method: "GET",
    },
    context
  );

  return (rows ?? [])
    .map((row) => reportRecordSchema.safeParse(row.payload))
    .filter((result) => result.success)
    .map((result) => result.data);
}

export async function readReports(context?: DataApiContext) {
  const remoteReports = await readRemoteReports(context);

  if (remoteReports) {
    return remoteReports;
  }

  return readLocalReports();
}

export async function getReportById(id: string, context?: DataApiContext) {
  if (DATA_API_URL) {
    const safeId = encodeURIComponent(id);
    const rows = await requestDataApi<{ payload: unknown }[]>(
      `flash_reports?id=eq.${safeId}&select=payload&limit=1`,
      {
        method: "GET",
      },
      context
    );

    if (!rows?.[0]) {
      return null;
    }

    const parsed = reportRecordSchema.safeParse(rows[0].payload);
    return parsed.success ? parsed.data : null;
  }

  const reports = await readLocalReports();
  return reports.find((report) => report.id === id) ?? null;
}

export async function saveReport(report: ReportRecord, context?: DataApiContext) {
  if (DATA_API_URL) {
    await requestDataApi(
      "flash_reports",
      {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify([
          {
            id: report.id,
            type: report.type,
            report_date: report.meta.reportDate,
            created_at: report.createdAt,
            updated_at: report.updatedAt,
            created_by: report.createdBy,
            payload: report,
          },
        ]),
      },
      context
    );

    return report;
  }

  const reports = await readLocalReports();
  const nextReports = [report, ...reports];
  await writeLocalReports(nextReports);
  return report;
}

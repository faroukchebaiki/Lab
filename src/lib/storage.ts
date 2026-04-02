import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import {
  type ReportRecord,
  reportRecordSchema,
  reportStoreSchema,
} from "@/lib/report-schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "flash-journal-records.json");

let sqlClient: postgres.Sql | null = null;
let tableReady: Promise<void> | null = null;

function getSqlClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!sqlClient) {
    sqlClient = postgres(process.env.DATABASE_URL, {
      max: 1,
      prepare: false,
      ssl: "require",
    });
  }

  return sqlClient;
}

async function ensureRemoteTable() {
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  if (!tableReady) {
    tableReady = (async () => {
      await sql`
        create table if not exists flash_reports (
          id text primary key,
          type text not null,
          report_date date not null,
          created_at timestamptz not null,
          updated_at timestamptz not null,
          created_by text not null,
          payload jsonb not null
        )
      `;
    })();
  }

  await tableReady;
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

async function readRemoteReports() {
  const sql = getSqlClient();

  if (!sql) {
    return null;
  }

  await ensureRemoteTable();

  const rows = await sql<{ payload: unknown }[]>`
    select payload
    from flash_reports
    order by created_at desc
  `;

  return rows
    .map((row) => reportRecordSchema.safeParse(row.payload))
    .filter((result) => result.success)
    .map((result) => result.data);
}

export async function readReports() {
  const remoteReports = await readRemoteReports();

  if (remoteReports) {
    return remoteReports;
  }

  return readLocalReports();
}

export async function getReportById(id: string) {
  const sql = getSqlClient();

  if (sql) {
    await ensureRemoteTable();

    const rows = await sql<{ payload: unknown }[]>`
      select payload
      from flash_reports
      where id = ${id}
      limit 1
    `;

    if (!rows[0]) {
      return null;
    }

    const parsed = reportRecordSchema.safeParse(rows[0].payload);
    return parsed.success ? parsed.data : null;
  }

  const reports = await readLocalReports();
  return reports.find((report) => report.id === id) ?? null;
}

export async function saveReport(report: ReportRecord) {
  const sql = getSqlClient();

  if (sql) {
    await ensureRemoteTable();

    await sql`
      insert into flash_reports (
        id,
        type,
        report_date,
        created_at,
        updated_at,
        created_by,
        payload
      ) values (
        ${report.id},
        ${report.type},
        ${report.meta.reportDate},
        ${report.createdAt},
        ${report.updatedAt},
        ${report.createdBy},
        ${sql.json(report)}
      )
    `;

    return report;
  }

  const reports = await readLocalReports();
  const nextReports = [report, ...reports];
  await writeLocalReports(nextReports);
  return report;
}

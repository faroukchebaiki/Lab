import { z } from "zod";

const requiredText = z.string().trim().min(1, "Required");
const optionalText = z.string().trim().default("");

export const reportTypeSchema = z.enum(["cao-horizontal", "hydration"]);

export const reportMetaSchema = z.object({
  companyName: requiredText.default("CHAUX BMA"),
  documentTitle: requiredText.default("Flash Journalier"),
  formCode: requiredText.default("FOR.CQ.05"),
  version: requiredText.default("A"),
  reportDate: requiredText,
  serviceLabel: requiredText.default("SERVICE LABORATOIRE"),
});

export const fourHorizontalRowSchema = z.object({
  id: requiredText,
  time: requiredText,
  refusalPercent: requiredText,
  observation: optionalText,
  kilnOutputTph: requiredText,
  gasDebitNm3h: requiredText,
});

export const hydrationBlockSchema = z.object({
  id: requiredText,
  hour: requiredText,
  gradeADensity: requiredText,
  gradeAFineness50: requiredText,
  gradeAFineness32: requiredText,
  gradeAHumidity: requiredText,
  gradeBDensity: requiredText,
  gradeBFineness50: requiredText,
  gradeBFineness32: requiredText,
  gradeBHumidity: requiredText,
});

export const fourHorizontalInputSchema = z.object({
  type: z.literal("cao-horizontal"),
  meta: reportMetaSchema,
  sectionTitle: requiredText.default("CAO SORTIE FOUR HORIZONTAL"),
  rows: z.array(fourHorizontalRowSchema).min(1),
});

export const hydrationInputSchema = z.object({
  type: z.literal("hydration"),
  meta: reportMetaSchema,
  sectionTitle: requiredText.default("ATELIER HYDRATATION"),
  blocks: z.array(hydrationBlockSchema).min(1),
});

export const reportInputSchema = z.discriminatedUnion("type", [
  fourHorizontalInputSchema,
  hydrationInputSchema,
]);

const reportBaseSchema = z.object({
  id: requiredText,
  createdAt: requiredText,
  updatedAt: requiredText,
  createdBy: requiredText,
});

export const fourHorizontalReportSchema = reportBaseSchema.merge(
  fourHorizontalInputSchema
);

export const hydrationReportSchema = reportBaseSchema.merge(
  hydrationInputSchema
);

export const reportRecordSchema = z.discriminatedUnion("type", [
  fourHorizontalReportSchema,
  hydrationReportSchema,
]);

export const reportStoreSchema = z.object({
  reports: z.array(reportRecordSchema).default([]),
});

export type FourHorizontalFormValues = z.input<typeof fourHorizontalInputSchema>;
export type HydrationFormValues = z.input<typeof hydrationInputSchema>;
export type FourHorizontalInput = z.output<typeof fourHorizontalInputSchema>;
export type HydrationInput = z.output<typeof hydrationInputSchema>;
export type ReportInput = z.output<typeof reportInputSchema>;
export type ReportRecord = z.infer<typeof reportRecordSchema>;

export function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const now = getTodayDateString();

export const defaultReportMeta = {
  companyName: "CHAUX BMA",
  documentTitle: "Flash Journalier",
  formCode: "FOR.CQ.05",
  version: "A",
  reportDate: now,
  serviceLabel: "SERVICE LABORATOIRE",
} satisfies z.input<typeof reportMetaSchema>;

export const defaultCaoRows: FourHorizontalInput["rows"] = [
  { id: "row-1", time: "09:00", refusalPercent: "04%", observation: "<2min", kilnOutputTph: "16", gasDebitNm3h: "1290" },
  { id: "row-2", time: "11:00", refusalPercent: "03%", observation: "", kilnOutputTph: "16", gasDebitNm3h: "1290" },
  { id: "row-3", time: "13:00", refusalPercent: "06%", observation: "<2min", kilnOutputTph: "16", gasDebitNm3h: "1290" },
  { id: "row-4", time: "15:00", refusalPercent: "02%", observation: "", kilnOutputTph: "16", gasDebitNm3h: "1290" },
  { id: "row-5", time: "17:00", refusalPercent: "01%", observation: "<2min", kilnOutputTph: "16", gasDebitNm3h: "1290" },
  { id: "row-6", time: "19:00", refusalPercent: "09,26%", observation: "Rco2", kilnOutputTph: "16", gasDebitNm3h: "1290" },
];

export const defaultHydrationBlocks: HydrationInput["blocks"] = [
  {
    id: "block-1",
    hour: "11:00",
    gradeADensity: "305",
    gradeAFineness50: "84,1",
    gradeAFineness32: "≤50 μm",
    gradeAHumidity: "0,84 %",
    gradeBDensity: "415",
    gradeBFineness50: "79,8",
    gradeBFineness32: "≤32 μm",
    gradeBHumidity: "0,70 %",
  },
  {
    id: "block-2",
    hour: "13:00",
    gradeADensity: "290",
    gradeAFineness50: "86,6",
    gradeAFineness32: "≤50 μm",
    gradeAHumidity: "0,61 %",
    gradeBDensity: "395",
    gradeBFineness50: "80,8",
    gradeBFineness32: "≤50 μm",
    gradeBHumidity: "0,47 %",
  },
];

export function buildReportRecord(input: ReportInput, createdBy: string): ReportRecord {
  const timestamp = new Date().toISOString();

  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy,
  };
}

import { format } from "date-fns";

import { type ReportRecord } from "@/lib/report-schema";

function formatDate(value: string) {
  try {
    return format(new Date(value), "d/M/yyyy");
  } catch {
    return value;
  }
}

function ReportHeader({ report }: { report: ReportRecord }) {
  return (
    <header className="grid grid-cols-[1.3fr_3fr_1.5fr] border border-black text-black">
      <div className="flex items-center justify-center border-r border-black p-4">
        <div className="flex flex-col items-center justify-center rounded-full border-2 border-lime-600 px-5 py-2 text-center">
          <span className="text-2xl font-bold tracking-tight text-lime-600">
            {report.meta.companyName}
          </span>
          <span className="text-xs font-semibold uppercase text-red-500">
            Laboratory
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 text-center text-[17px] font-semibold">
        {report.meta.documentTitle}
      </div>
      <div className="grid grid-rows-3 border-l border-black text-sm">
        <div className="flex items-center justify-center border-b border-black">
          {report.meta.formCode}
        </div>
        <div className="flex items-center justify-center border-b border-black">
          Version : {report.meta.version}
        </div>
        <div className="flex items-center justify-center">
          {formatDate(report.meta.reportDate)}
        </div>
      </div>
    </header>
  );
}

function CaoHorizontalSheet({ report }: { report: Extract<ReportRecord, { type: "cao-horizontal" }> }) {
  return (
    <div className="space-y-10">
      <div className="border border-black">
        <div className="border-b border-black py-2 text-center text-[17px] font-bold italic">
          {report.sectionTitle}
        </div>
        <table className="w-full border-collapse text-black">
          <thead>
            <tr className="text-sm">
              <th className="w-[18%] border-r border-b border-black py-2">HEURE</th>
              <th className="border-r border-b border-black py-2" colSpan={2}>
                REFUS JOUR %
              </th>
              <th className="w-[13%] border-r border-b border-black py-2">
                Sortie de Four T/h
              </th>
              <th className="w-[13%] border-b border-black py-2">
                DEBIT GAS NM3/h
              </th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.id} className="text-center text-[17px] font-semibold">
                <td className="border-r border-b border-black px-2 py-8">{row.time}</td>
                <td className="border-r border-b border-black bg-sky-100/70 px-2 py-8">
                  {row.refusalPercent}
                </td>
                <td className="border-r border-b border-black bg-lime-100/65 px-2 py-8 text-blue-700">
                  {row.observation}
                </td>
                <td className="border-r border-b border-black px-2 py-8">
                  {row.kilnOutputTph}
                </td>
                <td className="border-b border-black px-2 py-8">{row.gasDebitNm3h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pt-10 text-right text-[18px] font-bold italic text-black">
        {report.meta.serviceLabel}
      </p>
    </div>
  );
}

function HydrationSheet({ report }: { report: Extract<ReportRecord, { type: "hydration" }> }) {
  return (
    <div className="space-y-10">
      <div className="border border-black">
        <div className="border-b border-black py-2 text-center text-[17px] font-bold italic">
          {report.sectionTitle}
        </div>
        <table className="w-full border-collapse text-black">
          <thead>
            <tr className="text-sm">
              <th className="w-[12%] border-r border-b border-black py-2">HEURE</th>
              <th className="w-[18%] border-r border-b border-black py-2">DENSITE</th>
              <th className="border-r border-b border-black py-2" colSpan={2}>
                FINESSE %
              </th>
              <th className="w-[18%] border-r border-b border-black py-2">HUMIDITE</th>
              <th className="w-[12%] border-b border-black py-2"></th>
            </tr>
          </thead>
          <tbody>
            {report.blocks.flatMap((block) => {
              const rows = [
                {
                  key: `${block.id}-a`,
                  density: block.gradeADensity,
                  fineness50: block.gradeAFineness50,
                  fineness32: block.gradeAFineness32,
                  humidity: block.gradeAHumidity,
                  grade: "Grade A",
                  gradeClass:
                    "border-b border-r border-black bg-lime-100/65 px-2 py-8 font-semibold",
                },
                {
                  key: `${block.id}-b`,
                  density: block.gradeBDensity,
                  fineness50: block.gradeBFineness50,
                  fineness32: block.gradeBFineness32,
                  humidity: block.gradeBHumidity,
                  grade: "Grade B",
                  gradeClass:
                    "border-b border-r border-black bg-amber-50 px-2 py-8 font-semibold",
                },
              ];

              return rows.map((row, index) => (
                <tr key={row.key} className="text-center text-[17px]">
                  {index === 0 ? (
                    <td
                      rowSpan={2}
                      className="border-r border-b border-black px-2 py-8 text-[20px] font-bold [writing-mode:vertical-rl]"
                    >
                      {block.hour}
                    </td>
                  ) : null}
                  <td className={row.gradeClass}>{row.density}</td>
                  <td className="border-r border-b border-black bg-lime-100/45 px-2 py-5 font-semibold">
                    {row.fineness50}
                  </td>
                  <td className="border-r border-b border-black bg-lime-100/45 px-2 py-5 font-semibold">
                    {row.fineness32}
                  </td>
                  <td className="border-r border-b border-black bg-lime-100/45 px-2 py-8">
                    {row.humidity}
                  </td>
                  <td className="border-b border-black px-2 py-8 text-sm font-bold">
                    {row.grade}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
      <p className="pt-10 text-right text-[18px] font-bold italic text-black">
        {report.meta.serviceLabel}
      </p>
    </div>
  );
}

export function ReportSheet({ report }: { report: ReportRecord }) {
  return (
    <section
      id="report-sheet"
      className="report-sheet mx-auto bg-white px-4 py-5 shadow-[0_18px_55px_rgba(0,0,0,0.16)] sm:px-6"
    >
      <div className="space-y-10">
        <ReportHeader report={report} />
        {report.type === "cao-horizontal" ? (
          <CaoHorizontalSheet report={report} />
        ) : (
          <HydrationSheet report={report} />
        )}
      </div>
    </section>
  );
}

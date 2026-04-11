import { ReportBase } from "@/components/reports/report-base";

export default function VerticalKilnReportsPage() {
  return (
    <ReportBase
      title="Vertical Kiln Reports"
      description="This page is ready as a base for vertical kiln production reports. It gives you a dedicated place to add kiln readings, combustion checks, operator comments, and daily approval steps without mixing them into the other lab forms."
      status="Base ready"
      primaryActionLabel="Vertical kiln form coming next"
      checklist={[
        "Shift and operator identity block",
        "Feed, fuel, and burning-zone measurements",
        "Temperature, draft, and output checkpoints",
        "Comments, incidents, and supervisor signature area",
      ]}
      starterFields={[
        {
          label: "Shift information",
          hint: "Date, shift name, kiln line, and operator details.",
        },
        {
          label: "Process readings",
          hint: "Temperatures, pressures, feed rate, and fuel observations.",
        },
        {
          label: "Quality notes",
          hint: "Quick area for clinker or lime quality remarks and corrective action.",
        },
        {
          label: "Validation",
          hint: "Reserved for signatures, approval status, and final remarks.",
        },
      ]}
    />
  );
}

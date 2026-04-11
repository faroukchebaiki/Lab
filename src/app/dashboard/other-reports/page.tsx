import { ReportBase } from "@/components/reports/report-base";

export default function OtherReportsPage() {
  return (
    <ReportBase
      title="Other Reports"
      description="This section is the flexible base for any report that does not belong in the kiln, hydration, or grinding areas. It is useful for custom lab logs, audit sheets, temporary workflows, and future experimental report types."
      status="Base ready"
      primaryActionLabel="Custom report form coming next"
      checklist={[
        "Template chooser for ad-hoc report types",
        "Common metadata block shared across custom forms",
        "Attachment or observation area for unusual cases",
        "Review and printable output support",
      ]}
      starterFields={[
        {
          label: "Report category",
          hint: "Choose the custom workflow or subject of the report.",
        },
        {
          label: "Common details",
          hint: "Date, team, line, and document reference fields.",
        },
        {
          label: "Body content",
          hint: "Flexible rows or sections depending on the report need.",
        },
        {
          label: "Review",
          hint: "Reserved for quality approval, remarks, and archiving state.",
        },
      ]}
    />
  );
}

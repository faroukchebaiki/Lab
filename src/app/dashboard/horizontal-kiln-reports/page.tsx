import { CaoHorizontalForm } from "@/components/reports/cao-horizontal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HorizontalKilnReportsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle>Horizontale Kiln Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            This section is now the home for horizontal kiln reporting. The CAO
            report below is already connected, and the page is ready to grow with
            more kiln templates later.
          </p>
          <p>
            Good next additions here would be shift recap cards, kiln performance
            summaries, and separate forms for maintenance or incident tracking.
          </p>
        </CardContent>
      </Card>

      <CaoHorizontalForm />
    </div>
  );
}

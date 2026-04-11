import { HydrationForm } from "@/components/reports/hydration-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HydrationUnitReportsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle>Hydration Unit Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            This page is the base for hydration unit reporting. The current form is
            active and saved reports continue to work, while the section stays open
            for extra hydration sheets later.
          </p>
          <p>
            We can extend this area with batch summaries, lab approvals, and daily
            production notes whenever you want.
          </p>
        </CardContent>
      </Card>

      <HydrationForm />
    </div>
  );
}

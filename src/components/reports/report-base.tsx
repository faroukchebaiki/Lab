import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const outlineLinkClassName =
  "inline-flex h-8 w-fit shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type StarterField = {
  label: string;
  hint: string;
};

type ReportBaseProps = {
  title: string;
  description: string;
  status: string;
  primaryActionLabel: string;
  primaryActionHref?: string;
  checklist: string[];
  starterFields: StarterField[];
};

export function ReportBase({
  title,
  description,
  status,
  primaryActionLabel,
  primaryActionHref,
  checklist,
  starterFields,
}: ReportBaseProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card className="border-border/80 bg-card/95">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit">
            {status}
          </Badge>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          {primaryActionHref ? (
            <Link
              href={primaryActionHref}
              className={outlineLinkClassName}
            >
              {primaryActionLabel}
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <div
              className={cn(
                outlineLinkClassName,
                "pointer-events-none w-fit opacity-70"
              )}
            >
              {primaryActionLabel}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {starterFields.map((field) => (
              <div
                key={field.label}
                className="rounded-2xl border border-dashed border-border bg-muted/30 p-4"
              >
                <p className="text-sm font-medium">{field.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{field.hint}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" />
            Base Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {checklist.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-border bg-background/80 px-3 py-3"
            >
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

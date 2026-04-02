"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  defaultCaoRows,
  defaultReportMeta,
  type FourHorizontalFormValues,
  fourHorizontalInputSchema,
} from "@/lib/report-schema";

function getDefaultValues(): FourHorizontalFormValues {
  return {
    type: "cao-horizontal",
    meta: {
      ...defaultReportMeta,
      reportDate: new Date().toISOString().slice(0, 10),
    },
    sectionTitle: "CAO SORTIE FOUR HORIZONTAL",
    rows: defaultCaoRows.map((row, index) => ({
      ...row,
      id: `row-${index + 1}-${crypto.randomUUID()}`,
    })),
  };
}

export function CaoHorizontalForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<FourHorizontalFormValues>({
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  async function onSubmit(values: FourHorizontalFormValues) {
    setPending(true);

    try {
      const parsed = fourHorizontalInputSchema.safeParse(values);

      if (!parsed.success) {
        throw new Error("Please complete all required fields.");
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as {
        error?: string;
        report?: { id: string };
      };

      if (!response.ok || !data.report) {
        throw new Error(data.error ?? "Unable to save report.");
      }

      toast.success("CAO report saved.");
      form.reset(getDefaultValues());
      router.push(`/reports/${data.report.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save report."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-border/80 bg-white/92">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          CAO Horizontal Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          noValidate
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="cao-company">Company</Label>
              <Input id="cao-company" {...form.register("meta.companyName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cao-title">Document Title</Label>
              <Input id="cao-title" {...form.register("meta.documentTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cao-code">Form Code</Label>
              <Input id="cao-code" {...form.register("meta.formCode")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cao-version">Version</Label>
              <Input id="cao-version" {...form.register("meta.version")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cao-date">Report Date</Label>
              <Input
                id="cao-date"
                type="date"
                {...form.register("meta.reportDate")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cao-service">Footer Label</Label>
            <Input id="cao-service" {...form.register("meta.serviceLabel")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cao-section">Section Title</Label>
            <Input id="cao-section" {...form.register("sectionTitle")} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Measured Rows</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    id: crypto.randomUUID(),
                    time: "",
                    refusalPercent: "",
                    observation: "",
                    kilnOutputTph: "",
                    gasDebitNm3h: "",
                  })
                }
              >
                <Plus className="size-4" />
                Add Row
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 md:grid-cols-6"
                >
                  <div className="space-y-2">
                    <Label>Hour</Label>
                    <Input {...form.register(`rows.${index}.time`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Refus %</Label>
                    <Input {...form.register(`rows.${index}.refusalPercent`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Observation</Label>
                    <Input {...form.register(`rows.${index}.observation`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sortie de Four T/h</Label>
                    <Input {...form.register(`rows.${index}.kilnOutputTph`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Debit Gas NM3/h</Label>
                    <Input {...form.register(`rows.${index}.gasDebitNm3h`)} />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="h-11" disabled={pending}>
            {pending ? "Saving..." : "Save CAO Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

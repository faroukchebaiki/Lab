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
  defaultHydrationBlocks,
  defaultReportMeta,
  getTodayDateString,
  hydrationInputSchema,
  type HydrationFormValues,
} from "@/lib/report-schema";

function getDefaultValues(): HydrationFormValues {
  return {
    type: "hydration",
    meta: {
      ...defaultReportMeta,
      reportDate: getTodayDateString(),
    },
    sectionTitle: "ATELIER HYDRATATION",
    blocks: defaultHydrationBlocks.map((block, index) => ({
      ...block,
      id: `block-${index + 1}-${crypto.randomUUID()}`,
    })),
  };
}

export function HydrationForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<HydrationFormValues>({
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "blocks",
  });

  async function onSubmit(values: HydrationFormValues) {
    setPending(true);

    try {
      const parsed = hydrationInputSchema.safeParse(values);

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

      toast.success("Hydration report saved.");
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
        <CardTitle className="text-xl font-semibold">Hydration Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          noValidate
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="hyd-company">Company</Label>
              <Input id="hyd-company" {...form.register("meta.companyName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hyd-title">Document Title</Label>
              <Input id="hyd-title" {...form.register("meta.documentTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hyd-code">Form Code</Label>
              <Input id="hyd-code" {...form.register("meta.formCode")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hyd-version">Version</Label>
              <Input id="hyd-version" {...form.register("meta.version")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hyd-date">Report Date</Label>
              <Input
                id="hyd-date"
                type="date"
                {...form.register("meta.reportDate")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hyd-service">Footer Label</Label>
            <Input id="hyd-service" {...form.register("meta.serviceLabel")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hyd-section">Section Title</Label>
            <Input id="hyd-section" {...form.register("sectionTitle")} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Time Blocks</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    id: crypto.randomUUID(),
                    hour: "",
                    gradeADensity: "",
                    gradeAFineness50: "",
                    gradeAFineness32: "",
                    gradeAHumidity: "",
                    gradeBDensity: "",
                    gradeBFineness50: "",
                    gradeBFineness32: "",
                    gradeBHumidity: "",
                  })
                }
              >
                <Plus className="size-4" />
                Add Block
              </Button>
            </div>

            <div className="space-y-5">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-4 rounded-2xl border border-border/80 bg-muted/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-xs space-y-2">
                      <Label>Hour</Label>
                      <Input {...form.register(`blocks.${index}.hour`)} />
                    </div>
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

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3 rounded-2xl border border-lime-200 bg-lime-50/70 p-4">
                      <h4 className="font-semibold text-lime-950">Grade A</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Density</Label>
                          <Input {...form.register(`blocks.${index}.gradeADensity`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Humidity</Label>
                          <Input {...form.register(`blocks.${index}.gradeAHumidity`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Finesse ≤50 μm</Label>
                          <Input {...form.register(`blocks.${index}.gradeAFineness50`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Finesse ≤32 μm</Label>
                          <Input {...form.register(`blocks.${index}.gradeAFineness32`)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                      <h4 className="font-semibold text-amber-950">Grade B</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Density</Label>
                          <Input {...form.register(`blocks.${index}.gradeBDensity`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Humidity</Label>
                          <Input {...form.register(`blocks.${index}.gradeBHumidity`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Finesse ≤50 μm</Label>
                          <Input {...form.register(`blocks.${index}.gradeBFineness50`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Finesse ≤32 μm</Label>
                          <Input {...form.register(`blocks.${index}.gradeBFineness32`)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="h-11" disabled={pending}>
            {pending ? "Saving..." : "Save Hydration Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

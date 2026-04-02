"use client";

import { useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";

type ReportActionsProps = {
  targetId: string;
  fileName: string;
};

export function ReportActions({ targetId, fileName }: ReportActionsProps) {
  const [pending, setPending] = useState(false);

  async function downloadPdf() {
    const element = document.getElementById(targetId);

    if (!element) {
      toast.error("Printable area not found.");
      return;
    }

    setPending(true);

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = (canvas.height * usableWidth) / canvas.width;
      const image = canvas.toDataURL("image/png");

      pdf.addImage(image, "PNG", margin, margin, usableWidth, usableHeight);
      pdf.save(fileName);
      toast.success("PDF downloaded.");
    } catch {
      toast.error("Unable to generate the PDF.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="no-print flex flex-wrap gap-3">
      <Link
        href="/dashboard"
        className={buttonVariants({ variant: "outline" })}
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        Print
      </Button>
      <Button onClick={downloadPdf} disabled={pending}>
        <Download className="size-4" />
        {pending ? "Preparing..." : "Download PDF"}
      </Button>
    </div>
  );
}

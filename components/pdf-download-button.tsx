"use client"
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { generatePDF } from "@/lib/pdfgen";
import { getIncidentById } from "@/lib/db/queries/incident";
import { useTransition } from "react";

export default function PDFDownloadButton({ incidentId, className, isIcon }: { incidentId: string, className?: string, isIcon?: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleDownload = () => {
        startTransition(async () => {
            try {
                // Fetch incident data
                const incident = await getIncidentById(incidentId);

                // Generate PDF
                const pdfBytes = await generatePDF(incident);
                const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `unterweisung-${incidentId}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Failed to generate PDF:", error);
            }
        });
    };

    if (!isIcon) {
        return (
            <Button variant="outline" className={className} onClick={handleDownload} disabled={isPending}>
                <Download className="mr-2 size-5" />
                {isPending ? "Wird erstellt..." : "PDF herunterladen"}
            </Button>
        );
    }

    return (
        <Button variant="ghost" size="icon-lg" className={className} onClick={handleDownload} disabled={isPending}>
            <Download className="size-6" />
        </Button>
    );
}
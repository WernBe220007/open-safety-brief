"use client"
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { generatePDF } from "@/lib/pdfgen";

export default function PDFDownloadButton({ incidentId, className, isIcon }: { incidentId: string, className?: string, isIcon?: boolean }) {
    const handleDownload = async () => {
        const pdfBytes = await generatePDF();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `unterweisung-${incidentId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isIcon) {
        return (
            <Button variant="outline" className={className} onClick={handleDownload}>
                <Download className="mr-2 size-5" />
                PDF herunterladen
            </Button>
        );
    }

    return (
        <Button variant="ghost" size="icon-lg" className={className} onClick={handleDownload}>
            <Download className="size-6" />
        </Button>
    );
}
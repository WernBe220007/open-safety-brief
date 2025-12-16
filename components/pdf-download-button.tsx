"use client"
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export default function PDFDownloadButton({ incidentId, className }: { incidentId: string, className?: string }) {
    return (
        <Button variant="ghost" size="icon-lg" className={className} onClick={() => { alert(`Download PDF for incident ${incidentId}`) }}>
            <Download className="size-6" />
        </Button>
    );
}
"use client"
import Link from "next/link";
import { useTransition } from "react";
import { useWizard } from "../new-incident-wizard-context";
import PDFDownloadButton from "../pdf-download-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { generatePDF } from "@/lib/pdfgen";
import { getIncidentById } from "@/lib/db/queries/incident";
import { Home, Mail, Share2 } from "lucide-react";

export default function NewIncidentWizardStepDone({ previousStep: _previousStep, nextStep: _nextStep }: { previousStep: () => void; nextStep: () => void }) {
    const { data } = useWizard();
    const [isSharing, startTransition] = useTransition();
    void _previousStep;
    void _nextStep;

    const handleEmailShare = async () => {
        const subject = encodeURIComponent(`Unterweisung vom ${new Date(data.dateTime).toLocaleDateString()}`);
        const body = encodeURIComponent(`Die Unterweisung vom ${new Date(data.dateTime).toLocaleString()}.`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleNativeShare = () => {
        startTransition(async () => {
            const incident = await getIncidentById(data.incidentId);
            const pdfBytes = await generatePDF(incident);
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const file = new File([blob], `unterweisung-${data.incidentId}.pdf`, { type: "application/pdf" });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: `Unterweisung vom ${new Date(data.dateTime).toLocaleDateString()}`,
                        text: `Unterweisung - ${data.incidentReason}`,
                        files: [file],
                    });
                } catch (error) {
                    if ((error as Error).name !== "AbortError") {
                        console.error("Error sharing:", error);
                    }
                }
            } else {
                // download the file if native share is not supported
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(url);
                alert("Teilen wird auf diesem Gerät nicht unterstützt. Die Datei wurde heruntergeladen.");
            }
        });
    };

    return (
        <div>
            <h2 className="text-3xl mt-4 ml-4 mb-6">Unterweisung Beendet</h2>
            <Card className="mx-4 my-2">
                <CardHeader>
                    <CardTitle>{new Date(data.dateTime).toLocaleString()}</CardTitle>
                    <CardDescription>{data.incidentReason}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{data.instructor} - {data.incidentDepartment}</p>
                </CardContent>
            </Card>

            <div className="flex flex-col m-4">
                <div className="flex flex-col md:flex-row gap-2">
                    <PDFDownloadButton incidentId={data.incidentId} className="flex-1" />
                    <Button variant="outline" className="flex-1" onClick={handleEmailShare}>
                        <Mail className="mr-2 size-5" />
                        Per E-Mail senden
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleNativeShare} disabled={isSharing}>
                        <Share2 className="mr-2 size-5" />
                        {isSharing ? "Wird vorbereitet..." : "Teilen"}
                    </Button>
                </div>
            </div>
            <div className="m-4 flex justify-end">
                <Button asChild>
                    <Link href="/">
                        <Home className="mr-2 size-5" />
                        Fertig
                    </Link>
                </Button>
            </div>
        </div>
    );
}
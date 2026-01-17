"use client"
import { useWizard } from "../new-incident-wizard-context";
import PDFDownloadButton from "../pdf-download-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function NewIncidentWizardStepDone({ previousStep, nextStep }: { previousStep: () => void; nextStep: () => void }) {
    const { data } = useWizard();

    return (
        <div>
            <h2 className="text-3xl mt-4 ml-4 mb-6">Unterweisung Beendet</h2>
            <Card className="m-4">
                <CardHeader>
                    <CardTitle>{new Date(data.dateTime).toLocaleString()}</CardTitle>
                    <CardDescription>{data.incidentReason}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{data.instructor} - {data.incidentDepartment}</p>
                </CardContent>
                <PDFDownloadButton incidentId={data.incidentId} className="absolute right-4 top-1/2 -translate-y-1/2" />
            </Card>
        </div>
    );
}
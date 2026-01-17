import { getIncidents } from "@/lib/db/queries/incident";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import PDFDownloadButton from "./pdf-download-button";


export default async function Archive() {
    const incidents = await getIncidents();

    return (
        <div className="m-2 md:m-4">
            <h1 className="text-3xl">Archive</h1>
            <div className="my-4 mb-26 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {incidents.map((inc) => (
                    <Card key={inc.id} className="gap-2 relative">
                        <CardHeader>
                            <CardTitle>{inc.date.toLocaleDateString()}</CardTitle>
                            <CardDescription>{inc.reason}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>{inc.instructor} - {inc.department}</p>
                        </CardContent>
                        <PDFDownloadButton incidentId={inc.id} className="absolute right-4 top-1/2 -translate-y-1/2" isIcon />
                    </Card>
                ))}
            </div>
        </div>
    );
}
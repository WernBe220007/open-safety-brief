import { getIncidents } from "@/lib/db/queries/incident";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default async function Archive() {
    const incidents = await getIncidents();

    return (
        <div className="m-4">
            <h1 className="text-3xl">Archive</h1>
            {incidents.map((inc) => (
                <Card key={inc.id}>
                    <CardHeader>
                        <CardTitle>{inc.date.toLocaleDateString()}</CardTitle>
                        <CardDescription>{inc.reason}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{inc.instructor} - {inc.department}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
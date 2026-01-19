import { auth } from "@/lib/auth";
import { getIncidentById } from "@/lib/db/queries/incident";
import { generatePDF } from "@/lib/pdfgen";
import { headers } from "next/headers";
import { type NextRequest } from 'next/server'


export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const url = request.nextUrl;
    const incidentId = url.searchParams.get("incidentId");
    if (!incidentId) {
        return new Response("Bad Request: Missing incidentId", { status: 400 });
    }

    const incident = await getIncidentById(incidentId);

    // Generate PDF
    const pdfBytes = await generatePDF(incident);
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    return new Response(blob, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=unterweisung-${incident.id}.pdf`,
        },
    });
}
"use server";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { incident, incidentReason, incidentTopics, signature } from "../schema";

export interface CreateIncidentData {
    dateTime: string;
    department: string;
    reasonId: string;
    instructor: string;
    topicIds: string[];
    signatures: Array<{
        name: string;
        signatureData: string;
    }>;
}

export async function createIncident(data: CreateIncidentData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    return await db.transaction(async (tx) => {
        // Create the incident
        const [newIncident] = await tx
            .insert(incident)
            .values({
                date: new Date(data.dateTime),
                department: data.department,
                reason: data.reasonId,
                instructor: data.instructor,
            })
            .returning();

        // Create incident topics associations
        if (data.topicIds.length > 0) {
            await tx.insert(incidentTopics).values(
                data.topicIds.map((topicId) => ({
                    incidentId: newIncident.id,
                    topicId,
                }))
            );
        }

        // Create signatures
        if (data.signatures.length > 0) {
            await tx.insert(signature).values(
                data.signatures.map((sig) => ({
                    incidentId: newIncident.id,
                    name: sig.name,
                    signature: sig.signatureData,
                }))
            );
        }

        return newIncident;
    });
}

export async function getIncidents() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const data = await db.select({
        id: incident.id,
        date: incident.date,
        department: incident.department,
        reason: incidentReason.reason,
        instructor: incident.instructor,
    }).from(incident).leftJoin(incidentReason, eq(incident.reason, incidentReason.id)).orderBy(desc(incident.date));
    return data;
}
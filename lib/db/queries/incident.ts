"use server";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { department, incident, incidentReason, incidentTopics, signature, topic } from "../schema";
import { cacheLife } from "next/cache";

export interface CreateIncidentData {
    dateTime: string;
    departmentId: string;
    reasonId: string;
    instructor: string;
    topicIds: string[];
    signatures: Array<{
        name: string;
        kurz: string;
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
                department: data.departmentId,
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
                    kurz: sig.kurz,
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
        department: department.name,
        reason: incidentReason.reason,
        instructor: incident.instructor,
    }).from(incident)
        .leftJoin(department, eq(incident.department, department.id))
        .leftJoin(incidentReason, eq(incident.reason, incidentReason.id))
        .orderBy(desc(incident.date));
    return data;
}

async function queryForIncidentById(incidentId: string) {
    "use cache";
    cacheLife('days');

    // Get the incident with department and reason
    const [incidentData] = await db.select({
        id: incident.id,
        date: incident.date,
        department: department.name,
        reason: incidentReason.reason,
        instructor: incident.instructor,
    }).from(incident)
        .leftJoin(department, eq(incident.department, department.id))
        .leftJoin(incidentReason, eq(incident.reason, incidentReason.id))
        .where(eq(incident.id, incidentId));

    if (!incidentData) {
        throw new Error("Incident not found");
    }

    // Get the topics for this incident
    const topics = await db.select({
        id: topic.id,
        name: topic.name,
    }).from(incidentTopics)
        .innerJoin(topic, eq(incidentTopics.topicId, topic.id))
        .where(eq(incidentTopics.incidentId, incidentId));

    // Get the signatures for this incident
    const signatures = await db.select({
        id: signature.id,
        name: signature.name,
        kurz: signature.kurz,
        signedAt: signature.signedAt,
        signature: signature.signature,
    }).from(signature)
        .where(eq(signature.incidentId, incidentId));

    return {
        ...incidentData,
        topics,
        signatures,
    };
}

export async function getIncidentById(incidentId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    return await queryForIncidentById(incidentId);
}

export type IncidentDetail = Awaited<ReturnType<typeof getIncidentById>>;
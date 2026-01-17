"use server";
import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { incidentReason } from "../schema";

export async function getIncidentReasons() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const data = await db.select().from(incidentReason).orderBy(asc(incidentReason.reason));
    return data;
}

export async function createIncidentReason(reason: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const [newReason] = await db
        .insert(incidentReason)
        .values({
            reason,
        })
        .returning();

    return newReason;
}

export type IncidentReason = Awaited<ReturnType<typeof getIncidentReasons>>[number];

"use server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { incident, incidentReason } from "../schema";

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
    }).from(incident).leftJoin(incidentReason, eq(incident.reason, incidentReason.id));
    return data;
}
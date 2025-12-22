"use server";
import { and, desc, asc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { incident, topic } from "../schema";

export async function getTopics() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const data = await db.select().from(topic).orderBy(asc(topic.name));
    return data;
}

export async function createTopic(name: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const [newTopic] = await db
        .insert(topic)
        .values({
            name,
        })
        .returning();

    return newTopic;
}

export type Topic = Awaited<ReturnType<typeof getTopics>>[number];
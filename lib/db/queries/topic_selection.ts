"use server";
import { and, desc, asc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { topicSelection, topicSelectionTopics } from "../schema";

export async function getTopicSelections() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const data = await db.select().from(topicSelection).orderBy(asc(topicSelection.name));
    const topics = await db.select().from(topicSelectionTopics).orderBy(asc(topicSelectionTopics.topicId));

    return data.map((selection) => ({
        ...selection,
        topicIds: topics.filter((t) => t.topicSelectionId === selection.id).map((t) => t.topicId),
    }));
}

export async function createTopicSelection(name: string, topicIds: string[]) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const [insertedSelection] = await db.insert(topicSelection).values({
        name,
    }).returning();

    for (const topicId of topicIds) {
        await db.insert(topicSelectionTopics).values({
            topicSelectionId: insertedSelection.id,
            topicId,
        });
    }
}

export async function deleteTopicSelection(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    await db.delete(topicSelection).where(eq(topicSelection.id, id));
}

export type TopicSelection = Awaited<ReturnType<typeof getTopicSelections>>[number];
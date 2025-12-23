"use server";
import { and, desc, asc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { topicSelection } from "../schema";

export async function getTopicSelections() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const data = await db.select().from(topicSelection).orderBy(asc(topicSelection.name));
    return data;
}

export type TopicSelection = Awaited<ReturnType<typeof getTopicSelections>>[number];
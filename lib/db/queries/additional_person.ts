"use server";
import { and, desc, asc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { additionalPerson } from "../schema";

export async function getAdditionalPersons() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const data = await db.select().from(additionalPerson).orderBy(asc(additionalPerson.name));
    return data;
}

export async function createAdditionalPerson(name: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const [newAdditionalPerson] = await db
        .insert(additionalPerson)
        .values({
            name,
        })
        .returning();

    updateTag("persons");

    return newAdditionalPerson;
}

export type AdditionalPerson = Awaited<ReturnType<typeof getAdditionalPersons>>[number];
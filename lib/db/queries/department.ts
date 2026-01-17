"use server";
import { asc } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { department } from "../schema";

export async function getDepartments() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const data = await db.select().from(department).orderBy(asc(department.name));
    return data;
}

export async function createDepartment(name: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const [newDepartment] = await db
        .insert(department)
        .values({
            name,
        })
        .returning();

    return newDepartment;
}

export type Department = Awaited<ReturnType<typeof getDepartments>>[number];

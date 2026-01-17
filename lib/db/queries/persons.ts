import { cacheLife, cacheTag } from "next/cache";
import { getTeachers } from "../../graph";
import { asc, } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { additionalPerson } from "../schema";

async function fetchAdditionalPersons() {
    'use cache';
    cacheLife('days');
    cacheTag('persons');

    const data = await db.select().from(additionalPerson).orderBy(asc(additionalPerson.name));
    return data;
}


export async function getPersons() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const [graphMembers, additionalPersons] = await Promise.all([
        getTeachers(),
        fetchAdditionalPersons(),
    ]);

    const persons = [
        ...graphMembers,
        ...additionalPersons.map(person => ({
            id: person.id,
            displayName: person.name,
            mail: null,
        })),
    ];

    return persons;
}

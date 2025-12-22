import NewIncidentWizard from "@/components/new-incident-wizard";
import { auth } from "@/lib/auth";
import { getTopics } from "@/lib/db/queries/topics";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) return redirect("/");

    const topics = getTopics();

    return (
        <main>
            <NewIncidentWizard initialTopics={topics} />
        </main>
    );
}
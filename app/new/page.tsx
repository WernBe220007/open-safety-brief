import NewIncidentWizard from "@/components/new-incident-wizard";
import { auth } from "@/lib/auth";
import { getTopicSelections } from "@/lib/db/queries/topic_selection";
import { getTopics } from "@/lib/db/queries/topics";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) return redirect("/");

    const topics = getTopics();
    const presetTopicSelections = getTopicSelections();

    return (
        <main>
            <NewIncidentWizard initialTopics={topics} presetTopicSelections={presetTopicSelections} />
        </main>
    );
}
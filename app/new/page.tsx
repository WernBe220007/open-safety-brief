import NewIncidentWizard from "@/components/new-incident-wizard";
import { auth } from "@/lib/auth";
import { getDepartments } from "@/lib/db/queries/department";
import { getIncidentReasons } from "@/lib/db/queries/incident_reason";
import { getTopicSelections } from "@/lib/db/queries/topic_selection";
import { getTopics } from "@/lib/db/queries/topics";
import { getPersons } from "@/lib/db/queries/persons";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) return redirect("/");

    const topics = getTopics();
    const presetTopicSelections = getTopicSelections();
    const persons = getPersons();
    const reasons = getIncidentReasons();
    const departments = getDepartments();

    return (
        <main>
            <NewIncidentWizard initialTopics={topics} presetTopicSelections={presetTopicSelections} persons={persons} initialReasons={reasons} initialDepartments={departments} />
        </main>
    );
}
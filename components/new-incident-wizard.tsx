"use client"

import NewWizardProgress from "./new-wizard-progress";
import NewIncidentWizardSteps, { type NewIncidentWizardStepsProps } from "./new-incident-wizard-steps";
import { WizardProvider } from "./new-incident-wizard-context";

export default function NewIncidentWizard({ initialTopics, presetTopicSelections, persons, initialReasons, initialDepartments }: NewIncidentWizardStepsProps) {
    return (
        <WizardProvider>
            <NewIncidentWizardSteps initialTopics={initialTopics} presetTopicSelections={presetTopicSelections} persons={persons} initialReasons={initialReasons} initialDepartments={initialDepartments} />
            <div className="flex flex-row justify-center fixed bottom-10 w-screen -z-10">
                <NewWizardProgress />
            </div>
        </WizardProvider>
    );
}
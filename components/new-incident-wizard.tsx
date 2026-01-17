"use client"

import { useState } from "react";
import NewWizardProgress from "./new-wizard-progress";
import NewIncidentWizardSteps from "./new-incident-wizard-steps";
import type { Topic } from "@/lib/db/queries/topics";
import { TopicSelection } from "@/lib/db/queries/topic_selection";
import { Member } from "@/lib/graph";
import { WizardProvider } from "./new-incident-wizard-context";

interface NewIncidentWizardProps {
    initialTopics: Promise<Topic[]>;
    presetTopicSelections: Promise<TopicSelection[]>;
    persons: Promise<Member[]>;
}

export default function NewIncidentWizard({ initialTopics, presetTopicSelections, persons }: NewIncidentWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <WizardProvider>
            <NewIncidentWizardSteps currentStep={currentStep} setCurrentStep={setCurrentStep} initialTopics={initialTopics} presetTopicSelections={presetTopicSelections} persons={persons} />
            <div className="flex flex-row justify-center fixed bottom-10 w-screen">
                <NewWizardProgress currentStep={currentStep} setCurrentStep={setCurrentStep} />
            </div>
        </WizardProvider>
    );
}
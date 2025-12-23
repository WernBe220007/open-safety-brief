"use client"

import { useState } from "react";
import NewWizardProgress from "./new-wizard-progress";
import NewIncidentWizardSteps from "./new-incident-wizard-steps";
import type { Topic } from "@/lib/db/queries/topics";
import { TopicSelection } from "@/lib/db/queries/topic_selection";

interface NewIncidentWizardProps {
    initialTopics: Promise<Topic[]>;
    presetTopicSelections: Promise<TopicSelection[]>;
}

export default function NewIncidentWizard({ initialTopics, presetTopicSelections }: NewIncidentWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <>
            <NewIncidentWizardSteps currentStep={currentStep} setCurrentStep={setCurrentStep} initialTopics={initialTopics} presetTopicSelections={presetTopicSelections} />
            <div className="flex flex-row justify-center fixed bottom-10 w-screen">
                <NewWizardProgress currentStep={currentStep} setCurrentStep={setCurrentStep} />
            </div>
        </>
    );
}
"use client"

import { useState } from "react";
import NewWizardProgress from "./new-wizard-progress";
import NewIncidentWizardSteps from "./new-incident-wizard-steps";
import type { Topic } from "@/lib/db/queries/topics";
import type { IncidentReason } from "@/lib/db/queries/incident_reason";
import type { Department } from "@/lib/db/queries/department";
import { TopicSelection } from "@/lib/db/queries/topic_selection";
import { Member } from "@/lib/graph";
import { WizardProvider } from "./new-incident-wizard-context";

interface NewIncidentWizardProps {
    initialTopics: Promise<Topic[]>;
    presetTopicSelections: Promise<TopicSelection[]>;
    persons: Promise<Member[]>;
    initialReasons: Promise<IncidentReason[]>;
    initialDepartments: Promise<Department[]>;
}

export default function NewIncidentWizard({ initialTopics, presetTopicSelections, persons, initialReasons, initialDepartments }: NewIncidentWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <WizardProvider>
            <NewIncidentWizardSteps currentStep={currentStep} setCurrentStep={setCurrentStep} initialTopics={initialTopics} presetTopicSelections={presetTopicSelections} persons={persons} initialReasons={initialReasons} initialDepartments={initialDepartments} />
            <div className="flex flex-row justify-center fixed bottom-10 w-screen">
                <NewWizardProgress currentStep={currentStep} setCurrentStep={setCurrentStep} />
            </div>
        </WizardProvider>
    );
}
"use client"

import { useState } from "react";
import NewWizardProgress from "./new-wizard-progress";
import NewIncidentWizardSteps from "./new-incident-wizard-steps";
import type { Topic } from "@/lib/db/queries/topics";

interface NewIncidentWizardProps {
    initialTopics: Promise<Topic[]>;
}

export default function NewIncidentWizard({ initialTopics }: NewIncidentWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <>
            <NewIncidentWizardSteps currentStep={currentStep} setCurrentStep={setCurrentStep} initialTopics={initialTopics} />
            <div className="flex flex-row justify-center absolute bottom-10 w-screen">
                <NewWizardProgress currentStep={currentStep} setCurrentStep={setCurrentStep} />
            </div>
        </>
    );
}
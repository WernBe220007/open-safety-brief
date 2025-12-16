"use client"

import { useState } from "react";
import NewWizardProgress from "./new-wizard-progress";
import NewIncidentWizardSteps from "./new-incident-wizard-steps";

export default function NewIncidentWizard() {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <>
            <NewIncidentWizardSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
            <div className="flex flex-row justify-center absolute bottom-10 w-screen">
                <NewWizardProgress currentStep={currentStep} setCurrentStep={setCurrentStep} />
            </div>
        </>
    );
}
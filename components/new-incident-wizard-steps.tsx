"use client"

import { TopicSelection } from "@/lib/db/queries/topic_selection";
import NewIncidentWizardStepDone from "./new-incident-wizard-steps/new-incident-wizard-done";
import NewIncidentWizardStepNewIncident from "./new-incident-wizard-steps/new-incident-wizard-new-incident";
import NewIncidentWizardStepParticipants from "./new-incident-wizard-steps/new-incident-wizard-participants";
import NewIncidentWizardStepSignatures from "./new-incident-wizard-steps/new-incident-wizard-signatures";
import NewIncidentWizardStepSummary from "./new-incident-wizard-steps/new-incident-wizard-summary";
import type { Topic } from "@/lib/db/queries/topics";

interface NewIncidentWizardStepsProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    initialTopics: Promise<Topic[]>;
    presetTopicSelections: Promise<TopicSelection[]>;
}

export default function NewIncidentWizardSteps({ currentStep, setCurrentStep, initialTopics, presetTopicSelections }: NewIncidentWizardStepsProps) {
    function nextStep() {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    }

    function previousStep() {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }


    switch (currentStep) {
        case 0:
            return <NewIncidentWizardStepNewIncident previousStep={previousStep} nextStep={nextStep} initialTopics={initialTopics} presetTopicSelections={presetTopicSelections} />;
        case 1:
            return <NewIncidentWizardStepParticipants previousStep={previousStep} nextStep={nextStep} />;
        case 2:
            return <NewIncidentWizardStepSummary previousStep={previousStep} nextStep={nextStep} />;
        case 3:
            return <NewIncidentWizardStepSignatures previousStep={previousStep} nextStep={nextStep} />;
        case 4:
            return <NewIncidentWizardStepDone previousStep={previousStep} nextStep={nextStep} />;
        default:
            return <div>Unknown Step</div>;
    }
}
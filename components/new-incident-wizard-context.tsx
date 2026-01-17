"use client"

import { Member } from "@/lib/graph";
import { Topic } from "@/lib/db/queries/topics";
import { createContext, useContext, useState, ReactNode } from "react";

export interface WizardData {
    // Incident details
    dateTime: string;
    incidentDepartment: string;
    incidentReasonId: string;
    incidentReason: string;
    selectedTopicIds: string[];
    selectedTopics: Topic[];

    // Participants
    selectedPersonIds: string[];
    selectedPersons: Member[];
    temporaryPersons: Member[];

    // Summary / Instructor signature
    instructor: string;
    instructorSignature: string | null;

    // Participant signatures
    participantSignatures: Map<string, string>;
}

interface WizardContextType {
    data: WizardData;
    updateData: (updates: Partial<WizardData>) => void;
    resetData: () => void;
}

const initialWizardData: WizardData = {
    dateTime: new Date().toISOString().slice(0, 16),
    incidentDepartment: "",
    incidentReasonId: "",
    incidentReason: "",
    selectedTopicIds: [],
    selectedTopics: [],
    selectedPersonIds: [],
    selectedPersons: [],
    temporaryPersons: [],
    instructor: "",
    instructorSignature: null,
    participantSignatures: new Map(),
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<WizardData>(initialWizardData);

    const updateData = (updates: Partial<WizardData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const resetData = () => {
        setData(initialWizardData);
    };

    return (
        <WizardContext.Provider value={{ data, updateData, resetData }}>
            {children}
        </WizardContext.Provider>
    );
}

export function useWizard() {
    const context = useContext(WizardContext);
    if (context === undefined) {
        throw new Error("useWizard must be used within a WizardProvider");
    }
    return context;
}

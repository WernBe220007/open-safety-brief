"use client"

import { Member } from "@/lib/graph";
import { Suspense, use, useState } from "react";
import { Spinner } from "../ui/spinner";
import PersonsList from "../persons-list";
import AddPersonDialog from "../add-person-dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useWizard } from "../new-incident-wizard-context";

interface NewIncidentWizardStepParticipantsProps {
    previousStep: () => void;
    nextStep: () => void;
    persons: Promise<Member[]>;
}


export default function NewIncidentWizardStepParticipants({ previousStep, nextStep, persons }: NewIncidentWizardStepParticipantsProps) {
    const { data, updateData } = useWizard();
    const allPersons = use(persons);

    const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>(data.selectedPersonIds);
    const [temporaryPersons, setTemporaryPersons] = useState<Member[]>(data.temporaryPersons);

    const handlePersonAdded = (person: Member, isPermanent: boolean) => {
        if (!isPermanent) {
            setTemporaryPersons((prev) => [...prev, person]);
        }
        setSelectedPersonIds((prev) => [...prev, person.id]);
    };

    const handleNext = () => {
        if (selectedPersonIds.length !== 0) {
            const allAvailablePersons = [...allPersons, ...temporaryPersons];
            const selectedPersons = allAvailablePersons.filter(p => selectedPersonIds.includes(p.id));

            updateData({
                selectedPersonIds,
                selectedPersons,
                temporaryPersons,
            });
            nextStep();
        }
        else {
            toast.error("Bitte mindestens eine Person auswählen.");
        }
    }

    return (
        <>
            <div className="flex items-center justify-between mt-4 mx-4 mb-10">
                <h2 className="text-3xl">Teilnehmer</h2>
                <AddPersonDialog onPersonAdded={handlePersonAdded} />
            </div>

            <div className="m-2">
                <Suspense fallback={<Spinner />}>
                    <PersonsList
                        persons={persons}
                        temporaryPersons={temporaryPersons}
                        selectedIds={selectedPersonIds}
                        onSelectionChange={setSelectedPersonIds}
                    />
                </Suspense>
                <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={previousStep}>
                        Zurück
                    </Button>
                    <Button onClick={handleNext} disabled={selectedPersonIds.length === 0}>
                        Weiter
                    </Button>
                </div>
            </div>
        </>
    );
}
"use client"

import { useRef, useState, useMemo, useCallback, useTransition } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "../ui/button";
import { useWizard } from "../new-incident-wizard-context";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Check, UsersIcon, X, Loader2 } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../ui/command";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import SignaturesProgressbar from "../signatures-progressbar";
import { createIncident } from "@/lib/db/queries/incident";
import { toast } from "sonner";

export default function NewIncidentWizardStepSignatures({ previousStep, nextStep }: { previousStep: () => void; nextStep: () => void }) {
    const { data, updateData } = useWizard();
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [jumpOpen, setJumpOpen] = useState(false);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [isSaving, startTransition] = useTransition();

    // Sort participants alphabetically
    const sortedParticipants = useMemo(() => {
        return [...data.selectedPersons].sort((a, b) =>
            a.displayName.localeCompare(b.displayName, "de-DE")
        );
    }, [data.selectedPersons]);

    const currentParticipant = sortedParticipants[currentIndex];
    const totalParticipants = sortedParticipants.length;

    // Check if current has signed
    const hasCurrentSigned = currentParticipant
        ? data.participantSignatures.has(currentParticipant.id)
        : false;

    // Count how many have signed 
    const signedCount = useMemo(() => sortedParticipants.reduce((count, participant) => {
        return data.participantSignatures.has(participant.id) ? count + 1 : count;
    }, 0), [sortedParticipants, data.participantSignatures]);
    const allSigned = signedCount === totalParticipants;

    // Callback ref to load existing signature when canvas mounts
    const canvasRef = useCallback((canvas: SignatureCanvas | null) => {
        sigCanvas.current = canvas;
        if (canvas && currentParticipant) {
            const existingSignature = data.participantSignatures.get(currentParticipant.id);
            if (existingSignature) {
                canvas.fromDataURL(existingSignature);
            }
        }
    }, [currentParticipant, data.participantSignatures]);

    const saveCurrentSignature = () => {
        if (sigCanvas.current && currentParticipant && !sigCanvas.current.isEmpty()) {
            const signatureData = sigCanvas.current.toDataURL();
            const newSignatures = new Map(data.participantSignatures);
            newSignatures.set(currentParticipant.id, signatureData);
            updateData({ participantSignatures: newSignatures });
        }
    };

    const handleClear = () => {
        sigCanvas.current?.clear();
        if (currentParticipant) {
            const newSignatures = new Map(data.participantSignatures);
            newSignatures.delete(currentParticipant.id);
            updateData({ participantSignatures: newSignatures });
        }
    };

    const handleSignatureEnd = () => {
        saveCurrentSignature();
    };

    const handleJumpToParticipant = (index: number) => {
        saveCurrentSignature();
        setCurrentIndex(index);
        setJumpOpen(false);
    };

    const handleBack = () => {
        saveCurrentSignature();
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            previousStep();
        }
    };

    const saveIncidentToDatabase = () => {
        startTransition(async () => {
            try {
                // Build signatures array from all participants who have signed
                const signatures: Array<{ name: string; kurz: string; signatureData: string }> = [];
                for (const participant of sortedParticipants) {
                    const sig = data.participantSignatures.get(participant.id);
                    if (sig) {
                        // Derive kurz from email
                        const kurz = participant.mail
                            ? participant.mail.split('@')[0].toUpperCase()
                            : participant.displayName.substring(0, 4).toUpperCase();
                        signatures.push({
                            name: participant.displayName,
                            kurz,
                            signatureData: sig,
                        });
                    }
                }

                const { id } = await createIncident({
                    dateTime: data.dateTime,
                    departmentId: data.incidentDepartmentId,
                    reasonId: data.incidentReasonId,
                    instructor: data.instructor,
                    topicIds: data.selectedTopicIds,
                    signatures,
                });

                updateData({ incidentId: id });

                toast.success("Unterweisung erfolgreich gespeichert");
                nextStep();
            } catch (error) {
                console.error("Failed to save incident:", error);
                toast.error("Fehler beim Speichern der Unterweisung");
            }
        });
    };

    const handleNext = () => {
        saveCurrentSignature();
        if (currentIndex < totalParticipants - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            if (!allSigned) {
                setShowWarningDialog(true);
            } else {
                saveIncidentToDatabase();
            }
        }
    };

    const handleConfirmProceed = () => {
        setShowWarningDialog(false);
        saveIncidentToDatabase();
    };

    if (totalParticipants === 0) {
        return (
            <div>
                <h2 className="text-3xl mt-4 ml-4 mb-6">Unterschriften der Teilnehmer</h2>
                <div className="mx-4">
                    <p className="text-muted-foreground">Keine Teilnehmer ausgewählt.</p>
                </div>
                <div className="mt-6 mx-4 flex justify-between">
                    <Button variant="outline" onClick={previousStep}>
                        Zurück
                    </Button>
                    <Button onClick={nextStep}>
                        Weiter
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl mt-4 ml-4 mb-6">Unterschriften</h2>

            <div className="mx-2 md:mx-4 space-y-4 max-w-3xl">
                <SignaturesProgressbar
                    currentIndex={currentIndex}
                    total={totalParticipants}
                    signedCount={signedCount}
                />

                <div className="flex justify-end">
                    <Dialog open={jumpOpen} onOpenChange={setJumpOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <UsersIcon className="h-4 w-4 mr-2" />
                                Zu Teilnehmer springen
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Teilnehmer auswählen</DialogTitle>
                            </DialogHeader>
                            <Command>
                                <CommandInput placeholder="Teilnehmer suchen..." />
                                <CommandList className="max-h-80">
                                    <CommandEmpty>Kein Teilnehmer gefunden.</CommandEmpty>
                                    <CommandGroup>
                                        {sortedParticipants.map((participant, index) => (
                                            <CommandItem
                                                key={participant.id}
                                                value={participant.displayName}
                                                onSelect={() => handleJumpToParticipant(index)}
                                                className="flex items-center justify-between"
                                            >
                                                <span>{participant.displayName}</span>
                                                {data.participantSignatures.has(participant.id) ? (
                                                    <Check className="ml-2 h-4 w-4" />
                                                ) : (
                                                    <X className="ml-2 h-4 w-4" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="py-1">
                    <CardContent className="p-2">
                        <CardTitle className="text-xl mb-2 text-center">
                            {currentParticipant.displayName}
                        </CardTitle>
                        {currentParticipant.mail && (
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                {currentParticipant.mail}
                            </p>
                        )}

                        <SignatureCanvas
                            key={currentParticipant.id}
                            ref={canvasRef}
                            canvasProps={{
                                className: "border rounded-md border-border bg-white w-full h-48 touch-none"
                            }}
                            onEnd={handleSignatureEnd}
                        />

                        <div className="flex justify-between mt-2">
                            <p className="text-sm text-muted-foreground mt-2">
                                {!hasCurrentSigned ? "Noch nicht unterschrieben" : "Unterschrift gespeichert"}
                            </p>
                            <Button variant="outline" size="sm" onClick={handleClear}>
                                Löschen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 mx-4 flex justify-between">
                <Button variant="outline" onClick={handleBack} disabled={isSaving}>
                    Zurück
                </Button>
                <Button onClick={handleNext} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Speichern...
                        </>
                    ) : currentIndex === totalParticipants - 1 ? (
                        "Abschließen"
                    ) : (
                        "Weiter"
                    )}
                </Button>
            </div>

            <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Nicht alle Teilnehmer haben unterschrieben</AlertDialogTitle>
                        <AlertDialogDescription>
                            Es haben {signedCount} von {totalParticipants} Teilnehmern unterschrieben.
                            Möchten Sie trotzdem fortfahren?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSaving}>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmProceed} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Speichern...
                                </>
                            ) : (
                                "Trotzdem fortfahren"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
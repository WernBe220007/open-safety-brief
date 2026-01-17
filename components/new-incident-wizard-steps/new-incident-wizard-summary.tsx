"use client"

import { useCallback, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "../ui/button";
import { useWizard } from "../new-incident-wizard-context";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export default function NewIncidentWizardStepSummary({ previousStep, nextStep }: { previousStep: () => void; nextStep: () => void }) {
    const { data, updateData } = useWizard();
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [hasSigned, setHasSigned] = useState(!!data.instructorSignature);

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString("de-DE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            time: date.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };

    // Callback ref to load existing signature when canvas mounts
    const canvasRef = useCallback((canvas: SignatureCanvas | null) => {
        sigCanvas.current = canvas;
        if (canvas) {
            const existingSignature = data.instructorSignature;
            if (existingSignature) {
                canvas.fromDataURL(existingSignature);
            }
        }
    }, [data.instructorSignature]);

    const handleClear = () => {
        sigCanvas.current?.clear();
        setHasSigned(false);
        updateData({ instructorSignature: null });
    };

    const handleSignatureEnd = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const signatureData = sigCanvas.current.toDataURL();
            updateData({ instructorSignature: signatureData });
            setHasSigned(true);
        }
    };

    const handleNext = () => {
        if (hasSigned && sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const signatureData = sigCanvas.current.toDataURL();
            updateData({ instructorSignature: signatureData });
            nextStep();
        }
    };

    const { date, time } = formatDateTime(data.dateTime);

    return (
        <div className="pb-32">
            <h2 className="text-3xl mt-4 ml-4 mb-6">Zusammenfassung</h2>

            <div className="mx-4 space-y-2 max-w-3xl">
                <Card>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Datum:</span>
                            <span className="text-sm">{date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Uhrzeit:</span>
                            <span className="text-sm">{time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Abteilung:</span>
                            <span className="text-sm">{data.incidentDepartment || "—"}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-sm font-medium">Grund:</span>
                            <span className="text-sm">{data.incidentReason || "—"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <CardTitle className="text-lg flex items-center mb-2">
                            Themen ({data.selectedTopics.length})
                        </CardTitle>
                        {data.selectedTopics.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {data.selectedTopics.map((topic) => (
                                    <Badge key={topic.id} variant="secondary">
                                        {topic.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Keine Themen ausgewählt</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <CardTitle className="text-lg flex items-center mb-2">
                            Teilnehmer ({data.selectedPersons.length})
                        </CardTitle>
                        {data.selectedPersons.length > 0 ? (
                            <div className="space-y-2">
                                {data.selectedPersons.map((person) => (
                                    <div key={person.id} className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">{person.displayName}</span>
                                        {person.mail && (
                                            <span className="text-muted-foreground">({person.mail})</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Keine Teilnehmer ausgewählt</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <CardTitle className="text-lg flex items-center mb-2">
                            Unterschrift (Unterweiser)
                        </CardTitle>
                        <SignatureCanvas
                            ref={canvasRef}
                            canvasProps={{
                                className: "border rounded-md border-border bg-white w-full h-48 touch-none"
                            }}
                            onEnd={handleSignatureEnd}
                        />
                        <div className="flex justify-between mt-2">
                            {!hasSigned ? (
                                <p className="text-sm text-destructive mt-2">
                                    * Unterschrift erforderlich um fortzufahren
                                </p>
                            ) : (<div></div>)}
                            <Button variant="outline" size="sm" onClick={handleClear}>
                                Löschen
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 mx-4 flex justify-between">
                <Button variant="outline" onClick={previousStep}>
                    Zurück
                </Button>
                <Button onClick={handleNext} disabled={!hasSigned}>
                    Weiter
                </Button>
            </div>
        </div>
    );
}
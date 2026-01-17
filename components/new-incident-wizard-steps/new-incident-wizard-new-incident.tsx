"use client"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TopicSelector } from "@/components/topic-selector"
import { ReasonSelector } from "@/components/reason-selector"
import type { Topic } from "@/lib/db/queries/topics"
import type { IncidentReason } from "@/lib/db/queries/incident_reason"
import { Suspense, use } from "react"
import { Spinner } from "../ui/spinner"
import PresetSelection from "../preset-selection"
import { TopicSelection } from "@/lib/db/queries/topic_selection"
import { useWizard } from "../new-incident-wizard-context"

const formSchema = z.object({
    dateTime: z.string().min(1, "Datum ist erforderlich").transform((val) => new Date(val)).pipe(z.date()),
    incidentDepartment: z.string().min(1, "Abteilung ist erforderlich"),
    incidentReasonId: z.string().min(1, "Grund ist erforderlich"),
    incidentReason: z.string().min(1, "Grund ist erforderlich"),
    topicIds: z.array(z.string()),
})

interface NewIncidentWizardStepNewIncidentProps {
    previousStep: () => void;
    nextStep: () => void;
    initialTopics: Promise<Topic[]>;
    presetTopicSelections: Promise<TopicSelection[]>;
    initialReasons: Promise<IncidentReason[]>;
}

export default function NewIncidentWizardStepNewIncident({ previousStep, nextStep, initialTopics, presetTopicSelections, initialReasons }: NewIncidentWizardStepNewIncidentProps) {
    const { data, updateData } = useWizard();
    const topics = use(initialTopics);

    const form = useForm({
        defaultValues: {
            dateTime: data.dateTime,
            incidentDepartment: data.incidentDepartment,
            incidentReasonId: data.incidentReasonId,
            incidentReason: data.incidentReason,
            topicIds: data.selectedTopicIds,
        },
        validators: {
            onSubmit: formSchema,
            onChange: formSchema,
        },
        onSubmit: async ({ value }) => {
            const selectedTopics = topics.filter(t => value.topicIds.includes(t.id));
            updateData({
                dateTime: value.dateTime,
                incidentDepartment: value.incidentDepartment,
                incidentReasonId: value.incidentReasonId,
                incidentReason: value.incidentReason,
                selectedTopicIds: value.topicIds,
                selectedTopics: selectedTopics,
            });
            nextStep();
        },
    })

    return (
        <>
            <h2 className="text-3xl mt-4 ml-4 mb-6">Neuer Vorfall</h2>
            <form
                id="new-incident-form"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="m-4 max-w-3xl"
            >
                <FieldGroup>
                    <form.Field name="dateTime">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Datum / Uhrzeit</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        type="datetime-local"
                                    />
                                    {isInvalid && (
                                        <FieldError errors={field.state.meta.errors} />
                                    )}
                                </Field>
                            )
                        }}
                    </form.Field>
                    <form.Field name="incidentDepartment">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Abteilung</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                    />
                                    {isInvalid && (
                                        <FieldError errors={field.state.meta.errors} />
                                    )}
                                </Field>
                            )
                        }}
                    </form.Field>
                    <form.Field name="incidentReasonId">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel>Grund</FieldLabel>
                                    <Suspense fallback={<Spinner />}>
                                        <ReasonSelector
                                            initialReasons={initialReasons}
                                            selectedReasonId={field.state.value}
                                            onSelectionChange={(reasonId, reasonText) => {
                                                field.handleChange(reasonId)
                                                form.setFieldValue("incidentReason", reasonText)
                                            }}
                                        />
                                    </Suspense>
                                    {isInvalid && (
                                        <FieldError errors={field.state.meta.errors} />
                                    )}
                                </Field>
                            )
                        }}
                    </form.Field>
                    <form.Field name="topicIds">
                        {(field) => (
                            <Field>
                                <FieldLabel>Themen</FieldLabel>
                                <div className="flex flex-row gap-2">
                                    <Suspense fallback={<Spinner />}>
                                        <TopicSelector
                                            initialTopics={initialTopics}
                                            selectedTopicIds={field.state.value}
                                            onSelectionChange={(topicIds) => field.handleChange(topicIds)}
                                        />
                                    </Suspense>
                                    <Suspense fallback={<Spinner />}>
                                        <PresetSelection
                                            presetTopicSelections={presetTopicSelections}
                                            selectedTopicIds={field.state.value}
                                            onSelectionChange={(topicIds) => field.handleChange(topicIds)}
                                        />
                                    </Suspense>
                                </div>
                                <FieldError errors={field.state.meta.errors} />
                            </Field>
                        )}
                    </form.Field>
                </FieldGroup>
                <div className="mt-6 flex justify-end">
                    <Button type="submit">
                        Weiter
                    </Button>
                </div>
            </form>
        </>
    );
}
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
import type { Topic } from "@/lib/db/queries/topics"
import { Suspense } from "react"
import { Spinner } from "../ui/spinner"
import PresetSelection from "../preset-selection"
import { TopicSelection } from "@/lib/db/queries/topic_selection"

const formSchema = z.object({
    dateTime: z.string().min(1, "Datum ist erforderlich").transform((val) => new Date(val)).pipe(z.date()),
    incidentDepartment: z.string().min(1, "Abteilung ist erforderlich"),
    incidentReason: z.string().min(1, "Grund ist erforderlich"),
    topicIds: z.array(z.string()),
})

interface NewIncidentWizardStepNewIncidentProps {
    previousStep: () => void;
    nextStep: () => void;
    initialTopics: Promise<Topic[]>;
    presetTopicSelections: Promise<TopicSelection[]>;
}

export default function NewIncidentWizardStepNewIncident({ previousStep, nextStep, initialTopics, presetTopicSelections }: NewIncidentWizardStepNewIncidentProps) {
    const form = useForm({
        defaultValues: {
            dateTime: new Date().toISOString().slice(0, 16),
            incidentDepartment: "",
            incidentReason: "",
            topicIds: [] as string[],
        },
        validators: {
            onSubmit: formSchema,
            onChange: formSchema,
        },
        onSubmit: async ({ value }) => {
            alert(JSON.stringify(value, null, 2));
            nextStep();
        },
    })

    return (
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
                <form.Field name="incidentReason">
                    {(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Grund</FieldLabel>
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
                                    <PresetSelection presetTopicSelections={presetTopicSelections} />
                                </Suspense>
                            </div>
                            <FieldError errors={field.state.meta.errors} />
                        </Field>
                    )}
                </form.Field>
            </FieldGroup>
            <div className="mt-6 flex justify-end">
                <Button type="submit">
                    Next
                </Button>
            </div>
        </form>
    );
}
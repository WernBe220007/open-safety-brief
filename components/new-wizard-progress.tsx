"use client"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"
import { useWizard } from "./new-incident-wizard-context"

const steps = [
    { name: 'Neues Ereignis' },
    { name: 'Teilnehmer' },
    { name: 'Zusammenfassung' },
    { name: 'Unterschriften' },
    { name: 'Fertig' },
]

export default function NewWizardProgress() {
    const { currentStep, setCurrentStep } = useWizard();
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative')}>
                        {stepIdx < currentStep ? (
                            <>
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="h-0.5 w-full bg-blue-600 dark:bg-blue-500" />
                                </div>
                                <a
                                    onClick={() => { setCurrentStep(stepIdx) }}
                                    className="relative flex size-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-900 dark:bg-blue-500 dark:hover:bg-blue-400"
                                >
                                    <CheckIcon aria-hidden="true" className="size-5 text-white" />
                                    <span className="sr-only">{step.name}</span>
                                </a>
                            </>
                        ) : stepIdx === currentStep ? (
                            <>
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="h-0.5 w-full bg-gray-200 dark:bg-white/15" />
                                </div>
                                <a
                                    // onClick={() => { setCurrentStep(stepIdx) }}
                                    aria-current="step"
                                    className="relative flex size-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white dark:border-blue-500 dark:bg-gray-900"
                                >
                                    <span aria-hidden="true" className="size-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                                    <span className="sr-only">{step.name}</span>
                                </a>
                            </>
                        ) : (
                            <>
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="h-0.5 w-full bg-gray-200 dark:bg-white/15" />
                                </div>
                                <a
                                    // onClick={() => { setCurrentStep(stepIdx) }}
                                    className="group relative flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400 dark:border-white/15 dark:bg-gray-900 dark:hover:border-white/25"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="size-2.5 rounded-full bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-white/15"
                                    />
                                    <span className="sr-only">{step.name}</span>
                                </a>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
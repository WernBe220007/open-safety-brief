"use client"

import { Plus, ChevronsUpDown, Check } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { createIncidentReason, type IncidentReason } from "@/lib/db/queries/incident_reason"
import { cn } from "@/lib/utils"
import { use, useMemo, useRef, useState } from "react"
import { Spinner } from "./ui/spinner"

interface ReasonSelectorProps {
    initialReasons: Promise<IncidentReason[]>
    selectedReasonId: string
    onSelectionChange: (reasonId: string, reasonText: string) => void
}

export function ReasonSelector({
    initialReasons,
    selectedReasonId,
    onSelectionChange,
}: ReasonSelectorProps) {
    const initialReasonsData = use(initialReasons)
    const [open, setOpen] = useState(false)
    const [reasons, setReasons] = useState<IncidentReason[]>(initialReasonsData)
    const [searchValue, setSearchValue] = useState("")
    const [creating, setCreating] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedReason = useMemo(
        () => reasons.find((reason) => reason.id === selectedReasonId),
        [reasons, selectedReasonId]
    )

    const handleSelect = (reasonId: string) => {
        const reason = reasons.find((r) => r.id === reasonId)
        if (reason) {
            onSelectionChange(reason.id, reason.reason)
        }
        setOpen(false)
    }

    const handleCreateReason = async () => {
        if (!searchValue.trim()) return

        setCreating(true)
        try {
            const newReason = await createIncidentReason(searchValue.trim())
            setReasons((prev) => [...prev, newReason].sort((a, b) => a.reason.localeCompare(b.reason)))
            onSelectionChange(newReason.id, newReason.reason)
            setSearchValue("")
            setOpen(false)
        } catch (error) {
            console.error("Failed to create reason:", error)
        } finally {
            setCreating(false)
        }
    }

    const filteredReasons = useMemo(() => {
        if (!searchValue) return reasons
        return reasons.filter((reason) =>
            reason.reason.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [reasons, searchValue])

    const showCreateOption = useMemo(() => {
        if (!searchValue.trim()) return false
        return !reasons.some(
            (reason) => reason.reason.toLowerCase() === searchValue.toLowerCase()
        )
    }, [reasons, searchValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="reason-selector-list"
                    className={cn(
                        "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                        "cursor-pointer"
                    )}
                    onClick={() => {
                        setOpen(true)
                        setTimeout(() => inputRef.current?.focus(), 0)
                    }}
                >
                    {selectedReason ? (
                        <span>{selectedReason.reason}</span>
                    ) : (
                        <span className="text-muted-foreground">Grund auswählen...</span>
                    )}
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false} id="reason-selector-list">
                    <CommandInput
                        ref={inputRef}
                        placeholder="Grund suchen oder erstellen..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>Keine Gründe gefunden.</CommandEmpty>
                        {showCreateOption && (
                            <>
                                <CommandGroup heading="Neu erstellen">
                                    <CommandItem
                                        onSelect={handleCreateReason}
                                        disabled={creating}
                                    >
                                        <Plus className="size-4 mr-2" />
                                        {creating ? (
                                            <div className="flex flex-row items-center gap-2">
                                                <Spinner />
                                                Erstelle...
                                            </div>
                                        ) : (
                                            <>
                                                &quot;{searchValue}&quot; erstellen
                                            </>
                                        )}
                                    </CommandItem>
                                </CommandGroup>
                                <CommandSeparator />
                            </>
                        )}
                        <CommandGroup>
                            {filteredReasons.map((reason) => {
                                const isSelected = selectedReasonId === reason.id
                                return (
                                    <CommandItem
                                        key={reason.id}
                                        value={reason.id}
                                        onSelect={() => handleSelect(reason.id)}
                                    >
                                        <div className="mr-2 flex size-4 items-center justify-center">
                                            {isSelected && <Check className="size-4" />}
                                        </div>
                                        {reason.reason}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

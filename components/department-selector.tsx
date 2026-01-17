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
import { createDepartment, type Department } from "@/lib/db/queries/department"
import { cn } from "@/lib/utils"
import { use, useMemo, useRef, useState } from "react"
import { Spinner } from "./ui/spinner"

interface DepartmentSelectorProps {
    initialDepartments: Promise<Department[]>
    selectedDepartmentId: string
    onSelectionChange: (departmentId: string, departmentName: string) => void
}

export function DepartmentSelector({
    initialDepartments,
    selectedDepartmentId,
    onSelectionChange,
}: DepartmentSelectorProps) {
    const initialDepartmentsData = use(initialDepartments)
    const [open, setOpen] = useState(false)
    const [departments, setDepartments] = useState<Department[]>(initialDepartmentsData)
    const [searchValue, setSearchValue] = useState("")
    const [creating, setCreating] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedDepartment = useMemo(
        () => departments.find((dept) => dept.id === selectedDepartmentId),
        [departments, selectedDepartmentId]
    )

    const handleSelect = (departmentId: string) => {
        const dept = departments.find((d) => d.id === departmentId)
        if (dept) {
            onSelectionChange(dept.id, dept.name)
        }
        setOpen(false)
    }

    const handleCreateDepartment = async () => {
        if (!searchValue.trim()) return

        setCreating(true)
        try {
            const newDepartment = await createDepartment(searchValue.trim())
            setDepartments((prev) => [...prev, newDepartment].sort((a, b) => a.name.localeCompare(b.name)))
            onSelectionChange(newDepartment.id, newDepartment.name)
            setSearchValue("")
            setOpen(false)
        } catch (error) {
            console.error("Failed to create department:", error)
        } finally {
            setCreating(false)
        }
    }

    const filteredDepartments = useMemo(() => {
        if (!searchValue) return departments
        return departments.filter((dept) =>
            dept.name.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [departments, searchValue])

    const showCreateOption = useMemo(() => {
        if (!searchValue.trim()) return false
        return !departments.some(
            (dept) => dept.name.toLowerCase() === searchValue.toLowerCase()
        )
    }, [departments, searchValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="department-selector-list"
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
                    {selectedDepartment ? (
                        <span>{selectedDepartment.name}</span>
                    ) : (
                        <span className="text-muted-foreground">Abteilung auswählen...</span>
                    )}
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false} id="department-selector-list">
                    <CommandInput
                        ref={inputRef}
                        placeholder="Abteilung suchen oder erstellen..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>Keine Abteilungen gefunden.</CommandEmpty>
                        {showCreateOption && (
                            <>
                                <CommandGroup heading="Neu erstellen">
                                    <CommandItem
                                        onSelect={handleCreateDepartment}
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
                            {filteredDepartments.map((dept) => {
                                const isSelected = selectedDepartmentId === dept.id
                                return (
                                    <CommandItem
                                        key={dept.id}
                                        value={dept.id}
                                        onSelect={() => handleSelect(dept.id)}
                                    >
                                        <div className="mr-2 flex size-4 items-center justify-center">
                                            {isSelected && <Check className="size-4" />}
                                        </div>
                                        {dept.name}
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

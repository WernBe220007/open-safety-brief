"use client"

import { use, useState } from "react"
import { Member } from "@/lib/graph"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

interface PersonsListProps {
    persons: Promise<Member[]>
    temporaryPersons?: Member[]
    selectedIds: string[]
    onSelectionChange: (selectedIds: string[]) => void
}

export default function PersonsList({ persons, temporaryPersons = [], selectedIds, onSelectionChange }: PersonsListProps) {
    const resolvedPersons = use(persons)
    const [searchQuery, setSearchQuery] = useState("")

    const allPersons = [...resolvedPersons, ...temporaryPersons]

    const filteredPersons = allPersons.filter((person) =>
        person.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.mail?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleToggle = (personId: string) => {
        if (selectedIds.includes(personId)) {
            onSelectionChange(selectedIds.filter((id) => id !== personId))
        } else {
            onSelectionChange([...selectedIds, personId])
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search persons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>
            <ScrollArea className="h-[45vh] md:h-[55vh] rounded-md border p-4">
                <div className="flex flex-col gap-2">
                    {filteredPersons.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No persons found
                        </p>
                    ) : (
                        filteredPersons.map((person) => (
                            <div
                                key={person.id}
                                className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer"
                                onClick={() => handleToggle(person.id)}
                            >
                                <Checkbox
                                    id={person.id}
                                    checked={selectedIds.includes(person.id)}
                                    onCheckedChange={() => handleToggle(person.id)}
                                />
                                <Label
                                    htmlFor={person.id}
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="font-medium">{person.displayName}</div>
                                    {person.mail && (
                                        <div className="text-sm text-muted-foreground">
                                            {person.mail}
                                        </div>
                                    )}
                                </Label>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
            <p className="text-sm text-muted-foreground">
                {selectedIds.length} person{selectedIds.length !== 1 ? "s" : ""} selected
            </p>
        </div>
    )
}

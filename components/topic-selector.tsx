"use client"

import { X, Plus, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { createTopic, type Topic } from "@/lib/db/queries/topics"
import { cn } from "@/lib/utils"
import { use, useMemo, useRef, useState } from "react"
import { Spinner } from "./ui/spinner"
import { Checkbox } from "./ui/checkbox"

interface TopicSelectorProps {
    initialTopics: Promise<Topic[]>
    selectedTopicIds: string[]
    onSelectionChange: (topicIds: string[]) => void
}

export function TopicSelector({
    initialTopics,
    selectedTopicIds,
    onSelectionChange,
}: TopicSelectorProps) {
    const initialTopicsData = use(initialTopics)
    const [open, setOpen] = useState(false)
    const [topics, setTopics] = useState<Topic[]>(initialTopicsData)
    const [searchValue, setSearchValue] = useState("")
    const [creating, setCreating] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedTopics = useMemo(
        () => topics.filter((topic) => selectedTopicIds.includes(topic.id)),
        [topics, selectedTopicIds]
    )

    const handleSelect = (topicId: string) => {
        if (selectedTopicIds.includes(topicId)) {
            onSelectionChange(selectedTopicIds.filter((id) => id !== topicId))
        } else {
            onSelectionChange([...selectedTopicIds, topicId])
        }
    }

    const handleRemove = (topicId: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        onSelectionChange(selectedTopicIds.filter((id) => id !== topicId))
    }

    const handleCreateTopic = async () => {
        if (!searchValue.trim()) return

        setCreating(true)
        try {
            const newTopic = await createTopic(searchValue.trim())
            setTopics((prev) => [...prev, newTopic].sort((a, b) => a.name.localeCompare(b.name)))
            onSelectionChange([...selectedTopicIds, newTopic.id])
            setSearchValue("")
        } catch (error) {
            console.error("Failed to create topic:", error)
        } finally {
            setCreating(false)
        }
    }

    const filteredTopics = useMemo(() => {
        if (!searchValue) return topics
        return topics.filter((topic) =>
            topic.name.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [topics, searchValue])

    const showCreateOption = useMemo(() => {
        if (!searchValue.trim()) return false
        return !topics.some(
            (topic) => topic.name.toLowerCase() === searchValue.toLowerCase()
        )
    }, [topics, searchValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="topic-selector-list"
                    className={cn(
                        "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                        "cursor-text"
                    )}
                    onClick={() => {
                        setOpen(true)
                        setTimeout(() => inputRef.current?.focus(), 0)
                    }}
                >
                    {selectedTopics.map((topic) => (
                        <Badge key={topic.id} variant="secondary" className="gap-1 pr-1">
                            {topic.name}
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => handleRemove(topic.id, e)}
                                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 cursor-pointer"
                                aria-label={`${topic.name} entfernen`}
                            >
                                <X className="size-3" />
                            </span>
                        </Badge>
                    ))}
                    {selectedTopics.length === 0 && (
                        <span className="text-muted-foreground">Themen auswählen...</span>
                    )}
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false} id="topic-selector-list">
                    <CommandInput
                        ref={inputRef}
                        placeholder="Thema suchen oder erstellen..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>Keine Themen gefunden.</CommandEmpty>
                        {showCreateOption && (
                            <>
                                <CommandGroup heading="Neu erstellen">
                                    <CommandItem
                                        onSelect={handleCreateTopic}
                                        disabled={creating}
                                    >
                                        <Plus className="size-4 mr-2" />
                                        {creating ? (
                                            <div className="flex flex-row items-center gap-2">
                                                <Spinner />
                                                Erstelle..
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
                        <CommandGroup heading="Themen">
                            {filteredTopics.map((topic) => {
                                const isSelected = selectedTopicIds.includes(topic.id)
                                return (
                                    <CommandItem
                                        key={topic.id}
                                        value={topic.id}
                                        onSelect={() => handleSelect(topic.id)}
                                    >
                                        <div className="mr-2 flex size-4 items-center justify-center">
                                            <Checkbox checked={isSelected} className="size-4" />
                                        </div>
                                        {topic.name}
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

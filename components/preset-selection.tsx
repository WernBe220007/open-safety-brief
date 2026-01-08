"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { deleteTopicSelection, TopicSelection } from "@/lib/db/queries/topic_selection";
import { use, useTransition } from "react";
import PresetSelectionNewPreset from "./preset-selection-new-preset";
import { ScrollArea } from "./ui/scroll-area";
import { Frown, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PresetSelection({ presetTopicSelections, selectedTopicIds, onSelectionChange }: {
    presetTopicSelections: Promise<TopicSelection[]>; selectedTopicIds: string[];
    onSelectionChange: (topicIds: string[]) => void
}) {
    const router = useRouter();
    const [isPendingDelete, startTransitionDelete] = useTransition();
    const presetTopicSelectionsData = use(presetTopicSelections);


    const handleSelectPreset = (preset: TopicSelection) => {
        onSelectionChange(preset.topicIds);
    }

    const handleDeletePreset = (presetId: string) => {
        startTransitionDelete(async () => {
            await deleteTopicSelection(presetId);
            router.refresh();
            toast.success("Preset gelöscht");
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Presets</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Presets</DialogTitle>
                    <DialogDescription>
                        Wählen sie eine Vorlage oder speichern sie ihre aktuelle Auswahl als neue Vorlage.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[50vh] w-full pr-4">
                    <div className="flex flex-col gap-4" >
                        {presetTopicSelectionsData.map((preset) => (
                            <DialogClose key={preset.id} asChild>
                                <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex flex-row justify-between items-center" onClick={() => handleSelectPreset(preset)}>
                                    <div>
                                        <h3 className="font-semibold">{preset.name}</h3>
                                        <p className="text-sm text-muted-foreground">{preset.id}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="float-right ml-2"
                                        disabled={isPendingDelete}
                                        onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset.id); }}
                                        aria-label="Delete preset"
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </DialogClose>
                        ))}
                    </div>
                    {presetTopicSelectionsData.length === 0 && (
                        <div className="flex flex-col w-full h-[50vh] items-center justify-center">
                            <Frown className="mb-4 text-muted-foreground size-16" />
                            <p className="text-muted-foreground">Keine Presets vorhanden.</p>
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Aktuell als neue Vorlage speichern</Button>
                        </DialogTrigger>
                        <PresetSelectionNewPreset selectedTopicIds={selectedTopicIds} />
                    </Dialog>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
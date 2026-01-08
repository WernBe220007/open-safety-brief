"use client"

import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { createTopicSelection } from "@/lib/db/queries/topic_selection";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PresetSelectionNewPreset({ selectedTopicIds }: { selectedTopicIds: string[] }) {
    const router = useRouter();
    const [presetName, setPresetName] = useState("");
    const [isPendingCreate, startTransitionCreate] = useTransition();

    const createPreset = async () => {
        startTransitionCreate(async () => {
            await createTopicSelection(presetName, selectedTopicIds);
            setPresetName("");
            router.refresh();
            toast.success("Neues Preset erstellt");
        })
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Neues Preset</DialogTitle>
                <DialogDescription>
                    Benenne die aktuelle Auswahl um ein neues Preset zu erstellen.
                </DialogDescription>
            </DialogHeader>
            <Input placeholder="Preset Name" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={"outline"}>Abbrechen</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button disabled={isPendingCreate || presetName.trim() === ""} onClick={createPreset}>Erstellen</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}
"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { TopicSelection } from "@/lib/db/queries/topic_selection";

export default function PresetSelection({ presetTopicSelections }: { presetTopicSelections: Promise<TopicSelection[]>; }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Presets</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
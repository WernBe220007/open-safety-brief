"use client"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useTransition } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { createAdditionalPerson } from "@/lib/db/queries/additional_person"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Member } from "@/lib/graph"

interface AddPersonDialogProps {
    onPersonAdded: (person: Member, isPermanent: boolean) => void
}

type AddMode = "select" | "temporary" | "permanent"

export default function AddPersonDialog({ onPersonAdded }: AddPersonDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<AddMode>("select")
    const [personName, setPersonName] = useState("")
    const [isPending, startTransition] = useTransition()

    const resetDialog = () => {
        setMode("select")
        setPersonName("")
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            resetDialog()
        }
    }

    const handleAddTemporary = () => {
        if (personName.trim() === "") return

        const tempPerson: Member = {
            id: `temp-${Date.now()}`,
            displayName: personName.trim(),
            mail: null,
        }

        onPersonAdded(tempPerson, false)
        toast.success("Person temporär hinzugefügt")
        setOpen(false)
        resetDialog()
    }

    const handleAddPermanent = () => {
        if (personName.trim() === "") return

        startTransition(async () => {
            const newPerson = await createAdditionalPerson(personName.trim())
            const member = {
                id: newPerson.id,
                displayName: newPerson.name,
                mail: null,
            }
            onPersonAdded(member, true)
            router.refresh()
            toast.success("Person dauerhaft hinzugefügt")
            setOpen(false)
            resetDialog()
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Neu
                </Button>
            </DialogTrigger>
            <DialogContent>
                {mode === "select" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Person hinzufügen</DialogTitle>
                            <DialogDescription>
                                Wie möchten Sie die Person hinzufügen?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-4">
                            <Button
                                variant="outline"
                                className="justify-start h-auto py-4"
                                onClick={() => setMode("temporary")}
                            >
                                <div className="text-left">
                                    <div className="font-medium">Temporär</div>
                                    <div className="text-sm text-muted-foreground">
                                        Nur für diese Unterweisung
                                    </div>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start h-auto py-4"
                                onClick={() => setMode("permanent")}
                            >
                                <div className="text-left">
                                    <div className="font-medium">Dauerhaft</div>
                                    <div className="text-sm text-muted-foreground">
                                        In der Datenbank speichern
                                    </div>
                                </div>
                            </Button>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Abbrechen</Button>
                            </DialogClose>
                        </DialogFooter>
                    </>
                )}

                {(mode === "temporary" || mode === "permanent") && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                {mode === "temporary" ? "Temporäre Person" : "Dauerhafte Person"}
                            </DialogTitle>
                            <DialogDescription>
                                {mode === "temporary"
                                    ? "Diese Person wird nur für diese Unterweisung hinzugefügt."
                                    : "Diese Person wird dauerhaft in der Datenbank gespeichert."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="personName">Name</Label>
                            <Input
                                id="personName"
                                placeholder="Name der Person"
                                value={personName}
                                onChange={(e) => setPersonName(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setMode("select")}>
                                Zurück
                            </Button>
                            <Button
                                disabled={isPending || personName.trim() === ""}
                                onClick={mode === "temporary" ? handleAddTemporary : handleAddPermanent}
                            >
                                {isPending ? "Wird hinzugefügt..." : "Hinzufügen"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

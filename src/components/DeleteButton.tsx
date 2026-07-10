"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteNote } from "@/data/notes";
import { useNotes } from "@/context/NotesContext";
import { useAriaActionStatusAnnouncer } from "@/hooks/useAriaActionStatusAnnouncer";
import { useModal } from "@/context/InfoModalContext";
import { Note, NoteMutationResult } from "@/types";


type DeleteButtonProps =
{
    id: string;
    page: string;
    search: string;
}

export function DeleteButton(props: DeleteButtonProps)
{
    const { id, page, search } = props;
    const [deletedMessage, setDeletedMessage] = useState<string>("");
    
    const router = useRouter();
    const { setNotes, setHasDeletedMessage } = useNotes();
    const { confirm } = useModal();
    const { ariaMessage, announce } = useAriaActionStatusAnnouncer();
    
    
    async function handleDelete(): Promise<void>
    {
        
        const confirmed = await confirm(
            "Tem a certeza que deseja excluir?",
            {
                onCancel: async () => await announce("Exclusão cancelada."),
                focusButton: "secondary"
            }
        );
        
        if (confirmed === false)
        {
            return;
        }
        
        const deleted: NoteMutationResult = await deleteNote(id);
        
        if (deleted.error !== null)
        {
            setDeletedMessage(deleted.error);
            await announce(deleted.error);
            return;
        }
        
        const deletedData: Note | null = deleted.data;
        
        if (deletedData !== null)
        {
            setNotes((previousNotes) =>
            {
                const newNotes: Note[] = [];
                for (const note of previousNotes)
                {
                    if (note.id !== deletedData.id)
                    {
                        newNotes.push(note);
                    }
                }
                return(newNotes);
            });
        }
        
        setHasDeletedMessage("Nota deletada com sucesso.");
        router.push(`/dashboard?page=${page}&search=${search}`);
    }
    
    return(
        <>
        <div
            className="visually-hidden"
            aria-live="polite"
            aria-atomic="true"
        >
            {ariaMessage}
        </div>
        <button
            type="button"
            onClick={handleDelete}
        >
            Excluir
        </button>
        <p aria-hidden="true">{deletedMessage}</p>
        </>
    );
}

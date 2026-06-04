"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteNote } from "@/data/notes";
import { useNotes } from "@/context/NotesContext";
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
    const { notes, setNotes } = useNotes();
    
    
    async function handleDelete(): Promise<void>
    {
        const toDelete: Note | undefined = notes.find((note) => note.id === id);
        if (toDelete === undefined)
        {
            setDeletedMessage("Nota para deletar não encontrada.");
            return;
        }
        
        const confirmed = confirm("Tem a certeza que deseja excluir?");
        if (confirmed === false)
        {
            return;
        }
        
        const deleted: NoteMutationResult = await deleteNote(id);
        
        if (deleted.error !== null)
        {
            setDeletedMessage(deleted.error);
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
        
        router.push(`/dashboard?page=${page}&search=${search}`);
    }
    
    return(
        <>
        <p>{deletedMessage}</p>
        <button
            type="button"
            onClick={handleDelete}
        >
            Excluir
        </button>
        </>
    );
}

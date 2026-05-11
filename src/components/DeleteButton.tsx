"use client";

import { useRouter } from "next/navigation";
import { useNotes } from "@/context/NotesContext";


export function DeleteButton({ id }: { id: string })
{
    const router = useRouter();
    const { deleteNote } = useNotes();
    
    
    function handleDelete()
    {
        const confirmed = confirm("Tem a certeza que deseja excluir?");
        
        if (confirmed === false)
        {
            return;
        }
        
        deleteNote(id);
        router.push("/dashboard");
    }
    
    return(
        <button
            type="button"
            onClick={handleDelete}
        >
            Excluir
        </button>
    );
}

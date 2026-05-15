"use client";

import { use } from "react";
import { NoteForm } from "@/components/NoteForm";
import { useNotes } from "@/context/NotesContext";
import { DeleteButton } from "@/components/DeleteButton";


type EditNoteProps =
{
    params: Promise<{
        id: string;
    }>;
};

export default function EditNote(props: EditNoteProps)
{
    const { params } = props;
    const { id } = use(params);
    
    const { notes } = useNotes();
    
    if (notes.length > 0)
    {
        const note = notes.find((note) => note.id === id);
        if (note === undefined)
        {
            return(
                <main>
                    <p>Nota não encontrada</p>
                </main>
            );
        }
        
        return(
            <main>
                <h1>{note.title}</h1>
                <NoteForm initialData={note}/>
                <DeleteButton id={id}/>
            </main>
        );
    }
    
    return(<p>Notas ainda não carregaram</p>)
}

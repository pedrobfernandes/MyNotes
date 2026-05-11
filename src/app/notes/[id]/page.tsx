"use client";

import { use } from "react";
import { useNotes } from "@/context/NotesContext";
import { NoteForm } from "@/components/NoteForm";
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
    
    const note = notes.find((note) => note.id === id);
    
    if (!note)
    {
        return(<p>Nota não encontrada</p>);
    }
    
    return(
        <main>
            <h1>{note.title}</h1>
            <NoteForm initialData={note}/>
            <DeleteButton id={note.id}/>
        </main>
    );
}

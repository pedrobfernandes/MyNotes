"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { NoteForm } from "@/components/NoteForm";
import { useNotes } from "@/context/NotesContext";
import { DeleteButton } from "@/components/DeleteButton";
import { fetchNoteById } from "@/data/notes";
import { Note } from "@/types";
import styles from "./page.module.css";


type EditNoteProps =
{
    params: Promise<{
        id: string;
    }>;
};

export default function EditNote(props: EditNoteProps)
{
    const [note, setNote] = useState<Note | null>(null);
    const [loadMessage, setLoadMessage] = useState<string | null>(null);
    
    const { params } = props;
    const { id } = use(params);
    
    const { notes } = useNotes();
    
    
    async function loadNote(): Promise<void>
    {
        const contextNote: Note | undefined = notes.find((note) => note.id === id);
        if (contextNote !== undefined)
        {
            setNote(contextNote);
            setLoadMessage(null);
            return;
        }
        
        const dataBaseNote = await fetchNoteById(id);
        if (dataBaseNote.error !== null)
        {
            setLoadMessage(dataBaseNote.error);
            setNote(null);
            return;
        }
        
        setNote(dataBaseNote.data);
        setLoadMessage(null);
    }
    
    
    useEffect(() =>
    {
        loadNote();
    
    }, [id, notes]);
    
    
    if (loadMessage !== null)
    {
        return(<p>{loadMessage}</p>);
    }
    
    if (note !== null)
    {
        return(
            <main className={styles.editNoteContainer}>
                <h1>{note.title}</h1>
                <NoteForm initialData={note}/>
                <DeleteButton id={id}/>
            </main>
        );
    }
    
    return(<p>Carregando nota...</p>);
}

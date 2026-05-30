"use client";


import { useRouter } from "next/navigation";
import { useState } from "react";
import { Note, NoteMutationResult } from "@/types";
import { insertNote, updateNote } from "@/data/notes";
import { supabase } from "@/lib/supabase/client";
import {  UserResponse } from "@supabase/supabase-js";
import { useNotes } from "@/context/NotesContext";
import styles from "./NoteForm.module.css";



type NoteFormProps =
{
    initialData?: Note;
    redirectPath: string;
}


export function NoteForm(props: NoteFormProps)
{
    const { initialData, redirectPath } = props;
    
    const router = useRouter();
    const { setNotes } = useNotes();
    
    const [title, setTitle] = useState(initialData?.title || "");
    const [summary, setSummary] = useState(initialData?.summary || "");
    const [content, setContent] = useState(initialData?.content || "");

    
    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): Promise<void>
    {
        event.preventDefault();
        
        if (initialData !== undefined)
        {
            const updatedNote: NoteMutationResult = await updateNote({
                title: title,
                summary: summary,
                content: content,
            }, initialData.id);
            
            const updatedData: Note | null = updatedNote.data;
            if (updatedData !== null)
            {
                setNotes((previousNotes) =>
                {
                    const newNotes: Note[] = [];
                    for (const note of previousNotes)
                    {
                        if (note.id !== updatedData.id)
                        {
                            newNotes.push(note);
                        }
                    }
                    
                    return(newNotes.concat(updatedData));
                });
            }
            
        }
        else
        {
            const user: UserResponse = await supabase.auth.getUser();
            if (user.error !== null)
            {
                return;
            }
            
            const insertedNote: NoteMutationResult = await insertNote({
                title: title,
                summary: summary,
                content: content,
            }, user.data.user.id);
            
            const insertedData: Note | null = insertedNote.data;
            if (insertedData !== null)
            {
                setNotes((previousNotes) => [insertedData].concat(previousNotes));
            }
        }
        
        router.push(redirectPath);
    }
    
    
    function handleCancel()
    {
        router.push(redirectPath);
    }
    
    
    return(
        <form onSubmit={handleSubmit} className={styles.noteForm}>
            <div className={styles.inputGroup}>
                <label htmlFor="title">Título</label>
                <input
                    id="title"
                    className={styles.titleInput}
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="summary">Sumário</label>
                <input
                    id="summary"
                    className={styles.summaryInput}
                    type="text"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="content">Conteudo</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                />
            </div>
            
            
            <div className={styles.buttonGroup}>
                <button type="submit">
                    Salvar
                </button>
                <button type="button" onClick={handleCancel}>
                    Cancelar
                </button>
            </div>
        </form>
    );
}

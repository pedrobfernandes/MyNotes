"use client";


import { useRouter } from "next/navigation";
import { useState } from "react";
import { Note, NoteMutationResult } from "@/types";
import { insertNote, updateNote } from "@/data/notes";
import { supabase } from "@/lib/supabase/client";
import {  UserResponse } from "@supabase/supabase-js";
import { useNotes } from "@/context/NotesContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./NoteForm.module.css";



type NoteFormProps =
{
    initialData?: Note;
    redirectPath: string;
    id?: string;
}


export function NoteForm(props: NoteFormProps)
{
    const { initialData, redirectPath, id } = props;
    
    const router = useRouter();
    const { setNotes } = useNotes();
    
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    
    const MARKDOWN_GUIDE_URL: string =
        "https://docs.github.com/" +
        "pt/get-started/writing-on-github/" +
        "getting-started-with-writing-and-formatting-on-github/" +
        "basic-writing-and-formatting-syntax";

    
    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): Promise<void>
    {
        event.preventDefault();
        
        if (initialData !== undefined)
        {
            const updatedNote: NoteMutationResult = await updateNote({
                title: title,
                content: content,
            }, initialData.id);
            
            const updatedData: Note | null = updatedNote.data;
            if (updatedData !== null)
            {
                // Cuida de atualizar a interface (o estado)
                setNotes((previousNotes) =>
                {
                    
                    const newNotes: Note[] = [];
                    for (const note of previousNotes)
                    {
                        if (note.id !== updatedData.id)
                        {
                            newNotes.push(note);
                        }
                        else
                        {
                            newNotes.push(updatedData);
                        }
                    }
                    
                    return(newNotes);
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
                content: content,
            }, user.data.user.id);
            
            const insertedData: Note | null = insertedNote.data;
            if (insertedData !== null)
            {
                // Cuida de atualizar  interface
                setNotes((previousNotes) => [insertedData].concat(previousNotes));
            }
        }
        
        router.push(redirectPath);
    }
    
    
    function renderTextOrMarkDown()
    {
        if (previewMode === true)
        {
            return(
                <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            );
        }
        
        return(
            <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
            />
        );
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
                <label htmlFor="content">Conteudo</label>
                <div className={styles.inputGroupOptions}>
                    <button
                        className={styles.previewButton}
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        {previewMode ? "Escrever" : "Pré-visualizar"}
                    </button>
                    <a
                        className={styles.helpLink}
                        aria-label="Visualizar ajuda sobre Markdown"
                        href={MARKDOWN_GUIDE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                       Ajuda
                    </a>
                </div>
                {renderTextOrMarkDown()}
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

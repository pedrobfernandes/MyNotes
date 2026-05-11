"use client";


import { useRouter } from "next/navigation";
import { useState } from "react";
import { Note } from "@/types";
import { useNotes } from "@/context/NotesContext";



type NoteFormProps =
{
    initialData?: Note;
}


export function NoteForm(props: NoteFormProps)
{
    const { initialData } = props;
    const { createNote, updateNote } = useNotes();
    const router = useRouter();
    
    const [title, setTitle] = useState(initialData?.title || "");
    const [summary, setSummary] = useState(initialData?.summary || "");
    const [content, setContent] = useState(initialData?.content || "");
    
    
    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void
    {
        event.preventDefault();
        
        if (initialData)
        {
            updateNote({
                id: initialData.id,
                title: title,
                summary: summary,
                content: content,
                updatedAt: new Date().toLocaleDateString(),
            });
        }
        else
        {
            createNote({
                id: crypto.randomUUID(),
                title: title,
                summary: summary,
                content: content,
                updatedAt: new Date().toLocaleDateString(),
            });
        }
        
        router.push("/dashboard");
    }
    
    
    function handleCancel()
    {
        router.push("/dashboard");
    }
    
    
    return(
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Título</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>
            <div>
                <label htmlFor="summary">Sumário</label>
                <input
                    id="summary"
                    type="text"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                />
            </div>
            <div>
                <label htmlFor="content">Conteudo</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                />
            </div>
            
            
            <div>
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

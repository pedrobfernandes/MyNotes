"use client";


import { useState, useEffect } from "react";
import { use } from "react";
import { useNotes } from "@/context/NotesContext";
import { fetchNoteById } from "@/data/notes";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Note } from "@/types";
import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";



type ViewNoteProps =
{
    params: Promise<{
        id: string
    }>;
};


export default function ViewNote(props: ViewNoteProps)
{
    const [note, setNote] = useState<Note | null>(null);
    const [loadMessage, setLoadMessage] = useState<string | null>(null);
    
    const { params } = props;
    const { id } = use(params);
    
    const { notes } = useNotes();
    
    const searchParams = useSearchParams();
    const page = searchParams.get("page") ?? "1";
    const search = searchParams.get("search") ?? "";
    
    
    async function loadNote(): Promise<void>
    {
        // Aqui idealmente pega as notas do context. Mas caso o usuario por exemplo
        // aperte f5, pega (ou tenta) pegar do supabase
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
            <main className={styles.viewNoteContainer}>
                <article>
                    <header>
                        <h1>{note.title}</h1>
                    </header>
                    <section>
                        <ReactMarkdown>
                            {note.content}
                        </ReactMarkdown>
                    </section>
                    <footer>
                        <Link href={`/notes/${note.id}/edit?page=${page}&search=${search}`}>
                            Editar
                        </Link>
                        <Link href={`/dashboard?page=${page}&search=${search}`}>
                            Voltar
                        </Link>
                    </footer>
                </article>
            </main>
        );
    }
    
    return(<p>Carregando nota...</p>);
}

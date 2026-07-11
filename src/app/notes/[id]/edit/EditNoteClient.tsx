"use client";

import { useState, useEffect } from "react";
import { NoteForm } from "@/components/NoteForm";
import { useNotes } from "@/context/NotesContext";
import { fetchNoteById } from "@/data/notes";
import { Note } from "@/types";
import EditNoteSkeleton from "@/components/EditNoteSkeleton";
import styles from "./page.module.css";


type EditNoteClientProps =
{
    id: string;
    page: number;
    search: string;
};

export default function EditNoteClient(props: EditNoteClientProps)
{
    const [note, setNote] = useState<Note | null>(null);
    const [loadMessage, setLoadMessage] = useState<string | null>(null);
    
    /*  
        Aqui, cuida de pegar a página atual (antes de editar), e o
        termo de pesquisa. O componente NoteForm, serve tanto para
        edição de uma nota como também para criar uma nova nota.
        São dois caminhos de volta diferentes. Quando é nova nota,
        ao voltar atrás, volta para o dashboard, mas quando é para editar
        queremos que ao voltar para trás (ou submeter), volte para a página
        onde estavamos e com a mesma "filtragem que usamos" (o termo de pesquisa).
        Então aqui pega eles da url, porque o NoteForm recebe como props redirectPath
    */
    const { id, page, search } = props;
    const { notes } = useNotes();
    
    
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
            <main className={styles.editNoteContainer}>
                <h1>{note.title}</h1>
                <NoteForm
                    initialData={note}
                    redirectPath={`/notes/${note.id}?page=${page}&search=${search}`}
                   id={id}
                />
            </main>
        );
    }
    
    return(<EditNoteSkeleton/>);
}

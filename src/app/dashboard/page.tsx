"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import NoteCard from "@/components/NoteCard";
import { Note, FetchNotesResult } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { UserResponse } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { fetchNotes } from "@/data/notes";
import { useNotes } from "@/context/NotesContext";
import SearchForm from "@/components/SearchForm";
import Pagination from "@/components/Pagination"
import { NotebookPen, SquarePlus } from "lucide-react";
import styles from "./page.module.css";


export default function Dashboard()
{
    const [userId, setUserId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    
    const didInitialize: React.RefObject<boolean> = useRef<boolean>(false);
    
    const { notes, setNotes } = useNotes();
    const router = useRouter();
    
    
    async function getId(): Promise<void>
    {
        const user: UserResponse = await supabase.auth.getUser();
        
        if (user.error !== null)
        {
            setUserId(null);
            return;
        }
        
        setUserId(user.data.user.id);
    }
    
    
    async function getNotes(): Promise<void>
    {
        if (userId !== null)
        {
            const savedNotes: FetchNotesResult = await fetchNotes(userId);
            setNotes(savedNotes.data);
            
            if (savedNotes.error !== null)
            {
                setErrorMessage(savedNotes.error);
            }
        }
    }
    
    
    function renderNotes()
    {
        if (notes !== null)
        {
            const notesList = notes.map((note: Note) =>
            {
                return(<NoteCard key={note.id} note={note}/>);
            });
            
            return(notesList);
        }
        else
        {
            return(<p>{errorMessage}</p>);
        }
    }
    
    
    async function handleLogout(): Promise<void>
    {
        await supabase.auth.signOut();
        router.push("/");
    }
    
    
    async function checkSession(): Promise<void>
    {
        try
        {
            const response = await supabase.auth.getSession();
            
            if (response.error !== null)
            {
                router.push("/");
                return;
            }
            
            const session = response.data.session;
            
            if (session === null)
            {
                router.push("/");
            }
        }
        catch
        {
            router.push("/");
        }
    }
    
    
    useEffect(() =>
    {
        checkSession();
    
    }, []);
    
    
    useEffect(() =>
    {
        if (didInitialize.current === false)
        {
            didInitialize.current = true;
            getId();
        }
    
    }, []);
    
    
    useEffect(() =>
    {
        getNotes();
    
    }, [userId]);
    
    
    return(
        <main className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div className={styles.dashboardHeaderLeft}>
                    <button type="button" onClick={handleLogout}>
                        Sair
                    </button>
                    <h1  className={styles.dashboardHeading}>
                        Minhas Notas
                        <NotebookPen className="icon"/>
                    </h1>
                </div>
 
                <Link href="/notes/new">
                    <div className={styles.newNoteContainer}>
                        <SquarePlus/>
                        Nova Nota
                    </div>
                </Link>

                
            </header>
            <section className={styles.searchFormSection}>
                <h2 className="visually-hidden">Pesquisa de Notas</h2>
                <SearchForm/>
            </section>
            <section className={styles.notesSection}>
                <h2 className="visually-hidden">Lista de Notas</h2>
                <ul className={styles.notesContainer}>{renderNotes()}</ul>
                <Pagination/>
            </section>
        </main>
    );
}

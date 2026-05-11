"use client";

import { useEffect } from "react";
import Link from "next/link";
import NoteCard from "@/components/NoteCard";
import { Note } from "@/types";
import { useNotes } from "@/context/NotesContext";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export default function Dashboard()
{
    const { notes } = useNotes();
    const router = useRouter();
    
    function renderNotes()
    {
        const notesList = notes.map((note: Note) =>
        {
            return(<NoteCard key={note.id} note={note}/>);
        });
        
        return(notesList);
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
    
    
    return(
        <main>
            <header>
                <h1>My Notes</h1>
                
                <Link href="/notes/new">
                    + Nova Nota
                </Link>
            </header>
            
            <section aria-label="Lista de notas">
                <ul>{renderNotes()}</ul>
            </section>
            <button type="button" onClick={handleLogout}>
                Sair
            </button>
        </main>
    );
}

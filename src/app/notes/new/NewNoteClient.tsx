"use client"

import { useEffect } from "react";
import { NoteForm } from "@/components/NoteForm";
import { useAriaActionStatusAnnouncer } from "@/hooks/useAriaActionStatusAnnouncer";
import styles from "./page.module.css";


export default function NewNoteClient()
{
    const { ariaMessage, announce } = useAriaActionStatusAnnouncer();
    
    
    useEffect(() =>
    {
        announce("Página: Criar Nova Nota");
    
    }, []);
    
    
    return(
        <main className={styles.newNoteContainer}>
            <h1>Criar Nova Nota</h1>
            <NoteForm
                redirectPath="/dashboard"
            />
            <div
                className="visually-hidden"
                aria-live="polite"
                aria-atomic="true"
            >
                {ariaMessage}
            </div>
        </main>
    );
}

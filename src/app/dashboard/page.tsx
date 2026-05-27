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
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filter, setFilter] = useState<string>("");
    
    // Dá erro (ou issue) no next de 'qualquer coisa hydration' - whatever...
    // Se não usar isto para renderizar a paginação apenas quando
    // as notas estiverem prontas...
    const [isReady, setIsReady] = useState<boolean>(false);
    
    const didInitialize: React.RefObject<boolean> = useRef<boolean>(false);
    
    const { notes, setNotes } = useNotes();
    const router = useRouter();
    
    const normalizedFilter: string = normalize(filter);
    const filteredNotes: Note[] = notes.filter((note: Note) =>
    {
        let summary: string = "";
        if (note.summary !== null)
        {
            summary = note.summary;
        }
        
        return(
            normalize(note.title).includes(normalizedFilter) ||
            // Ou mais simples mas horroroso: normalize(note.summary ?? "")
            normalize(summary).includes(normalizedFilter)
        );
    })
    
    const notesPerPage: number = 6;
    const totalPages: number = Math.ceil(filteredNotes.length / notesPerPage);
    const startIndex: number = (currentPage - 1) * notesPerPage;
    const endIndex: number = startIndex + notesPerPage;
    
    
    
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
            
            setIsReady(true);
        }
    }
    
    
    function normalize(str: string): string
    {
        return(
            str
            .toLowerCase()
            .normalize("NFD") // caracteres acentuados
            .replace(/[\u0300-\u036f]/g, "") // acentos
            .replace(/ç/g, "c")
            .replace(/\s+/g, "") // remove espaços
        );
    }
    
    
    function renderNotes()
    {
        if (notes.length > 0)
        {
            const notesToShow: Note[] = filteredNotes.slice(startIndex, endIndex);
            const notesList = notesToShow.map((note: Note) =>
            {
                return(<NoteCard key={note.id} note={note}/>);
            });
            
            return(notesList);
        }

        return(<p>{errorMessage}</p>);
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
    
    
    
    function handleNextPage(): void
    {
        if (currentPage < totalPages)
        {
            setCurrentPage((previous) => previous + 1);
            return;
        }
    }
    
    function handlePreviousPage(): void
    {
        if (currentPage > 1)
        {
            setCurrentPage((previous) => previous - 1);
            return;
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
                <SearchForm setFilter={setFilter} setCurrentPage={setCurrentPage}/>
            </section>
            <section className={styles.notesSection}>
                <h2 className="visually-hidden">Lista de Notas</h2>
                <ul className={styles.notesContainer}>{renderNotes()}</ul>
                {
                    isReady &&
                    (
                        <Pagination
                            handleNextPage={handleNextPage}
                            handlePreviousPage={handlePreviousPage}
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />
                    )
                }
            </section>
        </main>
    );
}

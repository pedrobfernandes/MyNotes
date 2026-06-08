"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import NoteCard from "@/components/NoteCard";
import { Note, FetchNotesResult } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { UserResponse } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchNotes } from "@/data/notes";
import { useNotes } from "@/context/NotesContext";
import SearchForm from "@/components/SearchForm";
import Pagination from "@/components/Pagination"
import { NotebookPen, SquarePlus } from "lucide-react";
import styles from "./page.module.css";


export default function Dashboard()
{
    /*
        Para rastreamento de página e de termo de pesquisa
        usamos a url mesmo que fica mais facil para sincronizar
        os casos em que entra no card, e volta. Se não rastrear
        quando volta do card, se antes estava na página 3,
        volta para a 1 - chato né..
        Depois nos componentes e páginas que precisam, usamos
        useSearchParams() novamente para pegar os itens..
    */
    const searchParams = useSearchParams();
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialSearch = searchParams.get("search") || "";
    
    const [userId, setUserId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [filter, setFilter] = useState<string>(initialSearch);
    
    
    /*
        Aqui é para "agora", em "dev local" não executar o effect que pega
        o userId 2 vezes. Outros effects dependem do userId. Novamente, talvez
        tenha forma melhor e mais "react-way" de fazer, mas de novo é o que me
        ocorreu. Já dei em louco em outros projetos por conta disto e esta abordagem
        resolve e pronto.
    */
    const didInitialize: React.RefObject<boolean> = useRef<boolean>(false);
    
    const { notes, setNotes, hasLoadedNotes, setHasLoadedNotes } = useNotes();
    const router = useRouter();
    
    
    /*
        Cuida de pegar a pesquisa "normalizada" (minuscúlas, sem espaços etc)
        normalizedFilter fica de fora do filtro abaixo, pois ele é so 1 (o que foi digiado)
        então não precisa ser "processado varias vezes", apenas comparado.
        Apos apenas comparamos e colocamos no array as notas que correspondem
        ao filtro.
    */
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
            if (hasLoadedNotes === false)
            {
                const savedNotes: FetchNotesResult = await fetchNotes(userId);
                setNotes(savedNotes.data);
            
                if (savedNotes.error !== null)
                {
                    setErrorMessage(savedNotes.error);
                }
                
                setHasLoadedNotes(true);
            }
        }
    }
    
    
    
    // Cuida de "normalizar" o filtro dgitado e o
    // titulo e sumario das notas para comparação
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
                return(
                    <NoteCard
                        key={note.id}
                        note={note}
                        currentPage={currentPage}
                        filter={filter}
                />);
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
    
    
    
    /*
        Esta confesso que não entendi 100% o propósito.
        Melhor, eu sei o que faz obvio, mas não entendi 100% o que
        faz no dashboard.. Se a gente já está logado,
        porque necessita mesmo disto??
    */
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
    
    
    /*
        Cuida da busca em si, configura o filtro/termo
        coloca na página 1 né, pois se temos vários cards,
        e eu uso 8 por pagina, se tivermos 15 correspondencias
        queremos a página 1.
    */
    function handleSearch(term: string): void
    {
        setFilter(term);
        setCurrentPage(1);
        
        
        // usando a url podemos fazer isto né? Mais facil e menos chato que estado,
        // context whatever...
        router.replace(`/dashboard?page=1&search=${encodeURIComponent(term)}`);
    }
    
    
    function handleNextPage(): void
    {
        if (currentPage < totalPages)
        {
            /*
                Aqui segundo as "regras" deveria usar o estado anterior,
                ao invéz disto, mas sinceramente... whatever, a não ser que a pessoa
                tenha um tique nervoso e compulsivo de apertar o botão super rápido...
            */
            const nextPage: number = currentPage + 1
            setCurrentPage(nextPage);
            router.replace(`/dashboard?page=${nextPage}&search=${encodeURIComponent(filter)}`);
            return;
        }
    }
    
    function handlePreviousPage(): void
    {
        if (currentPage > 1)
        {
            // idem o item acima
            const previousPage: number = currentPage - 1;
            setCurrentPage(previousPage);
            router.replace(`/dashboard?page=${previousPage}&search=${encodeURIComponent(filter)}`);
            return;
        }
    }
    
    
    function handleGoToFirstPage(): void
    {
        if (currentPage > 1)
        {
            setCurrentPage(1);
            router.replace(`/dashboard?page=1&search=${encodeURIComponent(filter)}`);
            return;
        }
    }
    
    
    function handleGoToLastPage(): void
    {
        if (currentPage < totalPages)
        {
            setCurrentPage(totalPages);
            router.replace(`/dashboard?page=${totalPages}&search=${encodeURIComponent(filter)}`);
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
    
    
    useEffect(() =>
    {
        /*
            Aqui garante que o "engracadinho" não coloque na url
            ....page=-15. Quer dizer, pode colocar á vontade né mas
            vai para a página 1
        */
        if (currentPage < 1)
        {
            setCurrentPage(1);
            return;
        }
        
        
        /*
            E aqui idem.. se o engraçadinho(a) fizer algo como
            ....page=89 e temos apenas 20 páginas vai para a
            página 20
        */
        if (currentPage > totalPages && totalPages > 0)
        {
            setCurrentPage(totalPages);
        }
    
    }, [currentPage, totalPages]);
    
    
    return(
        <main className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div className={styles.dashboardHeaderLeft}>
                    <button type="button" onClick={handleLogout}>
                        Sair
                    </button>
                    <h1 className={styles.dashboardHeading}>
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
                <SearchForm
                    filter={filter}
                    handleSearch={handleSearch}
                />
            </section>
            <section className={styles.notesSection}>
                <h2 className="visually-hidden">Lista de Notas</h2>
                <ul className={styles.notesContainer}>{renderNotes()}</ul>
                {
                    hasLoadedNotes &&
                    (
                        <Pagination
                            handleNextPage={handleNextPage}
                            handlePreviousPage={handlePreviousPage}
                            handleGoToFirstPage={handleGoToFirstPage}
                            handleGoToLastPage={handleGoToLastPage}
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />
                    )
                }
            </section>
        </main>
    );
}

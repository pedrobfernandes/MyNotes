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
import { useModal } from "@/context/InfoModalContext";
import SearchForm from "@/components/SearchForm";
import Pagination from "@/components/Pagination"
import { useAriaActionStatusAnnouncer } from "@/hooks/useAriaActionStatusAnnouncer";
import { NotebookPen, SquarePlus } from "lucide-react";
import styles from "./page.module.css";
import NotesPlaceHolder from "@/components/NotesPlaceHolder";
import SearchFormPlaceholder from "@/components/SearchFormPlaceholder";


type DashboardClientProps =
{
    initialPage: number;
    initialSearch: string;
}


export default function DashboardClient(props: DashboardClientProps)
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
    const { initialPage, initialSearch } = props;
    
    const [userId, setUserId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [filter, setFilter] = useState<string>(initialSearch);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    
    // Url da edge function para remover a conta
    const deleteUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_DELETE_ACCOUNT_URL;
    
    // Hook de anununcios para o leitor de tela (ORCA)
    const { ariaMessage, announce } = useAriaActionStatusAnnouncer();
    
    
    /*
        Aqui é para "agora", em "dev local" não executar o effect que pega
        o userId 2 vezes. Outros effects dependem do userId. Novamente, talvez
        tenha forma melhor e mais "react-way" de fazer, mas de novo é o que me
        ocorreu. Já dei em louco em outros projetos por conta disto e esta abordagem
        resolve e pronto.
    */
    const didInitialize = useRef<boolean>(false);
    
    
    const
    {
        notes, setNotes, hasLoadedNotes,
        setHasLoadedNotes, hasDeletedMessage,
        setHasDeletedMessage
    
    } = useNotes();
    
    // Hook de modal que substitui alert e confirm nativo
    const { alert , confirm } = useModal();
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
        
        return(
            normalize(note.title).includes(normalizedFilter)
        );
    })
    
    const notesPerPage: number = 6;
    const totalPages: number = Math.ceil(filteredNotes.length / notesPerPage);
    const startIndex: number = (currentPage - 1) * notesPerPage;
    const endIndex: number = startIndex + notesPerPage;
    const notesToShow: Note[] = filteredNotes.slice(startIndex, endIndex);
    
    
    
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
                await announce("Carregando notas.");
                const savedNotes: FetchNotesResult = await fetchNotes(userId);
                setNotes(savedNotes.data);
            
                if (savedNotes.error !== null &&
                    savedNotes.status !== "empty")
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
    
    
    async function handleExcludeAccount(): Promise<void>
    {
        const confirmedExclusion = await confirm(
            "Tem a certeza que deseja excluir a sua conta?" +
            " Todos os seus dados serão deletados.",
            {
                onCancel: async () => await announce("Exclusão de conta cancelada"),
                focusButton: "secondary",
            }
        );
        
        if (confirmedExclusion === false)
        {
            return;
        }
        
        try
        {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session === null)
            {
                throw new Error("Nenhuma sessão ativa")
            }
            
            
            if (deleteUrl === undefined)
            {
                throw new Error("URL da Edge Function não configurada.")
            }
            
            const response = await fetch(deleteUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
            });
            
            const result = await response.json();
            
            if (result.ok === false)
            {
                throw new Error(result.error || "Falha ao deletar conta");
            }
            
            await alert(
                "Sua conta e todos os dados foram excluidos com sucesso." +
                " Em seguida irá sair da aplicação e retornar" +
                " á página inicial."
            );
            
            await supabase.auth.signOut();
            router.push("/");
        }
        catch (error)
        {
            await alert(`Erro ao deletar conta: ${error}`);
        }
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
        setHasSearched(true);
        setFilter(term);
        setCurrentPage(1);
        
        
        // usando a url podemos fazer isto né? Mais facil e menos chato que estado,
        // context whatever...
        router.replace(`/dashboard?page=1&search=${encodeURIComponent(term)}`);
    }
    
    
    function goToPage(page: number): void
    {
        setCurrentPage(page);
        router.replace(`/dashboard?page=${page}&search=${encodeURIComponent(filter)}`);
        
        announce(`Página ${page} de ${totalPages}`);
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
            goToPage(currentPage + 1);
            return;
        }
    }
    
    
    function handlePreviousPage(): void
    {
        if (currentPage > 1)
        {
            // idem o item acima
            goToPage(currentPage - 1);
            return;
        }
    }
    
    
    function handleGoToFirstPage(): void
    {
        if (currentPage > 1)
        {
            goToPage(1);
            return;
        }
    }
    
    
    function handleGoToLastPage(): void
    {
        if (currentPage < totalPages)
        {
            goToPage(totalPages);
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
    
    
    // Cuida de restaurar os focus(), incluindo se apertar f5...
    useEffect(() =>
    {
        if (hasLoadedNotes === false)
        {
            return;
        }
        
        const elementId = sessionStorage.getItem("restoreFocus");
        
        if (elementId === null)
        {
            return;
        }
        
        const element = document.getElementById(elementId);
        
        if (element !== null)
        {
            element.focus();
        }
        
        // Limpa o sessionStorage
        sessionStorage.removeItem("restoreFocus");
    
    }, [hasLoadedNotes]);
    
    
    // Cuida de anunciar os resultados da pesquisa, se algum..
    useEffect(() =>
    {
        if (hasLoadedNotes === false ||
            hasSearched === false ||
            filter === ""
        )
        {
            return;
        }
        
        if (filteredNotes.length === 0)
        {
            announce("Nenhuma correspondência encontrada.");
        }
        else if (filteredNotes.length === 1)
        {
            announce("Uma correspondência encontrada.");
        }
        else
        {
            announce(`${filteredNotes.length} correspondências encontradas.`);
        }
        
    }, [filter, filteredNotes.length, hasLoadedNotes, hasSearched, announce]);
    
    
    // Cuida de anunciar que a nota foi deletada
    useEffect(() =>
    {
        if (hasDeletedMessage === "")
        {
            return;
        }
        
        announce(hasDeletedMessage);
        setHasDeletedMessage("");
    
    }, [hasDeletedMessage, announce, setHasDeletedMessage]);
    
  
    return(
        <>
        
        <main className={styles.dashboardContainer}>
            <p
                className="visually-hidden"
                aria-live="polite"
                aria-atomic="true"
            >
                {ariaMessage}
            </p>
            
            <header className={styles.dashboardHeader}>
                <h1
                    className={styles.dashboardHeading}
                >
                    MyNotes
                    <NotebookPen className="icon"/>
                </h1>
            </header>
            <section className={styles.newNoteSection}>
                <Link
                    id="new-note-link"
                    className={styles.newNoteLink}
                    href="/notes/new"
                    onClick={() =>
                    {
                        sessionStorage.setItem(
                            "restoreFocus",
                            "new-note-link"
                        );
                    }}
                >
                    <div className={styles.newNoteContainer}>
                        <SquarePlus/>
                        Nova Nota
                    </div>
                </Link>
            </section>
            <section className={styles.searchFormSection}>
                {
                    (!hasLoadedNotes || notes.length === 0) &&
                        <SearchFormPlaceholder/>
                }
                
                {
                    hasLoadedNotes && notes.length > 0 &&
                        <>
                        <h2
                            id="search-form-title"
                            className="visually-hidden"
                        >
                            Pesquisa de Notas
                        </h2>
                        <SearchForm
                            filter={filter}
                            handleSearch={handleSearch}
                        />
                        </>
                }
            </section>
            <section className={styles.notesSection}>
                {
                    !hasLoadedNotes &&
                        <>
                        <ul className={styles.notesContainer}>
                            <NotesPlaceHolder count={6} animated={true}/>
                        </ul> 
                        <p className={styles.emptyMessage} aria-hidden="true">
                            Carregando Notas.
                        </p>
                        </>
                    
                }            
                
                {
                    hasLoadedNotes && notes.length > 0 &&
                        <>
                        <h2 className="visually-hidden">Lista de notas</h2>
                        <ul className={styles.notesContainer}>
                            {renderNotes()}
                            <NotesPlaceHolder count={Math.max(0, 6 - notes.length)}/>
                        
                        </ul>
                    </>
                }
                
                {
                    hasLoadedNotes && notes.length > 0 &&
                        <Pagination
                            handleNextPage={handleNextPage}
                            handlePreviousPage={handlePreviousPage}
                            handleGoToFirstPage={handleGoToFirstPage}
                            handleGoToLastPage={handleGoToLastPage}
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />
                }
                
                {
                    hasLoadedNotes && notes.length === 0 &&
                        <>
                        <ul className={styles.notesContainer}>
                                <NotesPlaceHolder count={6}/>
                           </ul> 
                        <p className={styles.emptyMessage}>
                            Ainda não há notas criadas
                        </p>
                        </>
                }

            </section>
            <footer className={styles.footerSection}>
                <button
                    type="button"
                    onClick={handleLogout}
                >
                    Sair
                </button>
                <button
                    type="button"
                    onClick={handleExcludeAccount}
                >
                    Excluir Conta
                </button>
            </footer>
        </main>
        </>
    );
}

"use client";

import { useState, createContext, useContext } from "react";
import { Note } from "@/types";



/*
    hasLoadedNotes e setHasLoadedNotes, se tornam necessarias
    por conta de 3 motivos. 1 - No dasboard dava issue no next
    de "qualquer coisa hydration mismatch.. whatever.." por conta de quando aperta
    por exemplo f5, os botões de paginação no server acho que estavam disabled e no client
    não estavam, pois aqui no client já tinha pego as notas do context.
    2 - somente renderiza os botoes quando hasLoadedNotes for true, caso contrario
    ao entrar em uma nota e voltar, por uns 1 ou 2 segundos o espaço dos botoes
    esta vazio e so ao fim desse tempo que aparece..
    3 - O fluxo é: login, fetchNotes no supabase - preenche o context.
    Então sem o hasLoadedNotes, na função getNotes no dashboard, acabava sempre por fazer fetch,
    mesmo que as notas já ca estivessem... Assim somente faz fetch quando hasLoadedNotes
    for false, depois preenche o context e a partir dai usa o context.
*/
type NotesContextType =
{
    notes: Note[] | [];
    setNotes: React.Dispatch<React.SetStateAction<Note[] | []>>;
    hasLoadedNotes: boolean;
    setHasLoadedNotes: React.Dispatch<React.SetStateAction<boolean>>;
};

type NotestProviderProps =
{
    children: React.ReactNode;
}


const NotesContext = createContext<NotesContextType | undefined>(undefined);


export function NotesProvider(props: NotestProviderProps)
{
    const { children } = props;
    const [notes, setNotes] = useState<Note[] | []>([]);
    const [hasLoadedNotes, setHasLoadedNotes] = useState<boolean>(false);
    
    return(
        <NotesContext.Provider
            value={{
                notes,
                setNotes,
                hasLoadedNotes,
                setHasLoadedNotes
            }}
        >
            {children}
        </NotesContext.Provider>
    );
}


export function useNotes()
{
    const context = useContext(NotesContext);
    
    if (context === undefined)
    {
        throw new Error("useNotes tem que ser usado dentro de NotesProvider.");
    }
    
    return(context);
}

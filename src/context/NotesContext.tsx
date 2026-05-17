"use client";

import { useState, createContext, useContext } from "react";
import { Note } from "@/types";


type NotesContextType =
{
    notes: Note[] | [];
    setNotes: React.Dispatch<React.SetStateAction<Note[] | []>>;
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
    
    return(
        <NotesContext.Provider
            value={{
                notes,
                setNotes,
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

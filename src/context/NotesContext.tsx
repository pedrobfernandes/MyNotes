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


const NotestContext = createContext<NotesContextType | undefined>(undefined);


export function NotesProvider(props: NotestProviderProps)
{
    const { children } = props;
    const [notes, setNotes] = useState<Note[] | []>([]);
    
    return(
        <NotestContext.Provider
            value={{
                notes,
                setNotes,
            }}
        >
            {children}
        </NotestContext.Provider>
    );
}


export function useNotes()
{
    const context = useContext(NotestContext);
    
    if (context === undefined)
    {
        throw new Error("useNotes tem que ser usado dentro de NotesProvider.");
    }
    
    return(context);
}

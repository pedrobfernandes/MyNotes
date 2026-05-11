"use client";

import { createContext, useContext, useState } from "react";
import { notes as initialNotes } from "@/data/notes";
import { Note } from "@/types";


type NotesContextType =
{
    notes: Note[];
    createNote: (note: Note) => void;
    updateNote: (note: Note) => void;
    deleteNote: (id: string) => void;
};


const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode })
{
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    
    
    function createNote(note: Note): void
    {
        setNotes((previousNotes) =>
        {
            const newNote = [note];
            return(
                newNote.concat(previousNotes)
            );
            
        });
    }
    
    
    function updateNote(updatedNote: Note): void
    {
        setNotes((previousNotes) =>
        {
            const newNotes: Note[] = [];
            
            for (const note of previousNotes)
            {
                if (note.id === updatedNote.id)
                {
                    newNotes.push(updatedNote);
                }
                else
                {
                    newNotes.push(note);
                }
            }
            
            return(newNotes);
        });
    }
    
    
    function deleteNote(id: string): void
    {
        // setNotes((prev) => prev.filter((note) => note.id !== id));
        
        setNotes((previousNotes) =>
        {
            const newNotes: Note[] = [];
            
            for (const note of previousNotes)
            {
                if (note.id !== id)
                {
                    newNotes.push(note);
                }
            }
            
            return(newNotes);
        });
    }
    
    
    return(
        <NotesContext.Provider
            value={{ notes, createNote, updateNote, deleteNote }}
        >
            {children}
        </NotesContext.Provider>
    );
}


export function useNotes(): NotesContextType
{
    const context: NotesContextType | null = useContext(NotesContext);
    
    if (context === null)
    {
        throw new Error("useNotes tem que ser usado dentro de NotesProvider");
    }
    
    return(context)
}

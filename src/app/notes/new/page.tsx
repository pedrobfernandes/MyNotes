import type { Metadata } from "next";
import { NoteForm } from "@/components/NoteForm";
import styles from "./page.module.css";


export const metadata: Metadata = { title: "Nova Nota" };

export default function NewNote()
{

    return(
        <main className={styles.newNoteContainer}>
            <h1>Nova Nota</h1>
            <NoteForm
                redirectPath="/dashboard"
            />
        </main>
    );
}

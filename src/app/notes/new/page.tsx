import type { Metadata } from "next";
import { NoteForm } from "@/components/NoteForm";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Criar Nota" };

export default function Page()
{
     return(
        <main className={styles.newNoteContainer}>
            <h1>Criar Nova Nota</h1>
            <NoteForm
                redirectPath="/dashboard"
            />
        </main>
    );
}

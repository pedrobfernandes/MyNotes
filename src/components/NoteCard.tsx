import Link from "next/link";
import { Note } from "@/types";
import styles from "./NoteCard.module.css"

type NoteCardProps =
{
    note: Note;
    currentPage: number;
    filter: string;
};


export default function NoteCard(props: NoteCardProps)
{
    const { note, currentPage, filter } = props;
    
    const created_at = new Date(note.created_at).toLocaleString(
        "pt-Br",
        {
             timeZone: "America/Sao_paulo",
        }
    );
    
    const updated_at = new Date(note.updated_at).toLocaleString(
        "pt-Br",
        {
            timeZone: "America/Sao_paulo",
        }
    );
    
    
    function renderContent()
    {
        return(
            <article>
                <h2>{note.title}</h2>
                <p>
                    {note.summary}
                </p>
                <small>Criado: {created_at}</small>
                <br/>
                <small>Atualizado: {updated_at}</small>
            </article>
        );
    }
    
    return(
        <li className={styles.noteCard}>
            <Link href={`/notes/${note.id}?page=${currentPage}&search=${encodeURIComponent(filter)}`}>
                {renderContent()}
            </Link>
        </li>
    );
}

import Link from "next/link";
import { Note } from "@/types";
import { formatDateTime, formatAccessibleDateTime } from "@/utils/date";
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
    
    const createdAtVisual = formatDateTime(note.created_at);
    const createdAtAccessible = formatAccessibleDateTime(note.created_at);
    
    const updatedAtVisual = formatDateTime(note.updated_at);
    const updatedAtAccessible = formatAccessibleDateTime(note.updated_at);

    
    
    function renderContent()
    {
        return(
            <article>
                <h2 id={`title-${note.id}`}>{note.title}</h2>
                <div aria-hidden="true">
                    <small>Criado: {createdAtVisual}</small>
                    <br/>
                    <small>Atualizado: {updatedAtVisual}</small>
                </div>
                <div id={`meta-${note.id}`} className="visually-hidden">
                    <small>Criado: {createdAtAccessible}</small>
                    <br/>
                    <small>Atualizado: {updatedAtAccessible}</small>
                </div>
            </article>
        );
    }
    
    
    /*
        Pelo que testei com o leitor de tela ORCA, mesmo estando
        semânticamente correto, o leitor lê apenas algo como:
        "link" ou "link visitado", sem ler o titulo.
        Então temos o labelledby e o describedby. Agora o leitor
        lê algo como: "Como instalar o Flatpak no Slackware - Link"
        "Criado: data", "Atualizado: Data"
    */
    return(
        <li className={styles.noteCard}>
            <Link
                id={`note-${note.id}`}
                href={`/notes/${note.id}?page=${currentPage}&search=${encodeURIComponent(filter)}`}
                aria-labelledby={`title-${note.id}`}
                aria-describedby={`meta-${note.id}`}
                onClick={() =>
                {
                    sessionStorage.setItem(
                        "restoreFocus",
                        `note-${note.id}`
                    );
                }}
            >
                {renderContent()}
            </Link>
        </li>
    );
}

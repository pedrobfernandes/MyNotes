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
    
    // Cuida de mostrar na interface a data no "nosso formato" ao invéz
    // do formato que o supabase usa.
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
                <h2 id={`title-${note.id}`}>{note.title}</h2>
                <div id={`meta-${note.id}`}>
                    <small>Criado: {created_at}</small>
                    <br/>
                    <small>Atualizado: {updated_at}</small>
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

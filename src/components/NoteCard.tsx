import Link from "next/link";
import { Note } from "@/types";

type NoteCardProps =
{
    note: Note;
};


export default function NoteCard(props: NoteCardProps)
{
    const { note } = props;
    
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
                <small>Atualizado: {created_at}</small>
                <br/>
                <small>Atualizado: {updated_at}</small>
            </article>
        );
    }
    
    return(
        <li>
            <Link href={`/notes/${note.id}`}>
                {renderContent()}
            </Link>
        </li>
    );
}

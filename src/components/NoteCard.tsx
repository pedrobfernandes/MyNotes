import Link from "next/link";
import { Note } from "@/types";

type NoteCardProps =
{
    note: Note;
};


export default function NoteCard(props: NoteCardProps)
{
    const { note } = props;
    
    function renderContent()
    {
        return(
            <article>
                <h2>{note.title}</h2>
                <p>
                    {note.summary}
                </p>
                <small>Atualizado: {note.updatedAt}</small>
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

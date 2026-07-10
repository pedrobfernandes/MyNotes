import type { Metadata } from "next";
import NewNoteClient from "./NewNoteClient";

export const metadata: Metadata = { title: "Criar Nota" };

export default function Page()
{
    return(<NewNoteClient/>);
}

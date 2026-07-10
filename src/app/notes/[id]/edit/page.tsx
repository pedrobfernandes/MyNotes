import type { Metadata } from "next";
import EditNoteClient from "./EditNoteClient";


type PageProps =
{
    params: Promise<{
        id: string;
    }>;
}


export const metadata: Metadata = { title: "Editar Nota" };

export default async function Page(props: PageProps)
{
    const { id } = await props.params;
    return(<EditNoteClient id={id}/>);
}

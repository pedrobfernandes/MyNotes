import type { Metadata } from "next";
import ViewNoteClient from "./ViewNoteClient";


type PageProps =
{
    params: Promise<{
        id: string;
    }>;
}


export const metadata: Metadata = { title: "Visualizar Nota" };


export default async function Page(props: PageProps)
{
    const { id } = await props.params;
    
    return(<ViewNoteClient id={id}/>);
}

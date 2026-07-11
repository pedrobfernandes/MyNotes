import type { Metadata } from "next";
import EditNoteClient from "./EditNoteClient";


type PageProps =
{
    params: Promise<{
        id: string;
        page: string;
        search: string;
    }>;
}


export const metadata: Metadata = { title: "Editar Nota" };

export default async function Page(props: PageProps)
{
    const { id, page, search } = await props.params;
    
    return(
        <EditNoteClient
            id={id}
            page={Number(page ?? "1")}
            search={search ?? ""}
        />
    );
}

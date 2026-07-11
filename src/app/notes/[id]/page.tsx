import type { Metadata } from "next";
import ViewNoteClient from "./ViewNoteClient";


type PageProps =
{
    params: Promise<{
        id: string;
        page?: string;
        search?: string;
    }>;
}


export const metadata: Metadata = { title: "Visualizar Nota" };


export default async function Page(props: PageProps)
{
    const { id, page, search } = await props.params;
    
    return(
        <ViewNoteClient
            id={id}
            page={Number(page ?? "1")}
            search={search ?? ""}
        />
    );
}

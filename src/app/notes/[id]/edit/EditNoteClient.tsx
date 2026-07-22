"use client";

import { NoteForm } from "@/components/NoteForm";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { fetchNoteById } from "@/data/notes";
import EditNoteSkeleton from "@/components/EditNoteSkeleton";
import styles from "./page.module.css";


type EditNoteClientProps =
{
    id: string;
};

export default function EditNoteClient(props: EditNoteClientProps)
{
    const { id } = props;
    
    const noteQuery = useQuery({
        queryKey: ["note", id],
        queryFn: async () =>
        {
            const result = await fetchNoteById(id);
            
            if (result.error !== null)
            {
                throw new Error(result.error);
            }
            
            return(result.data);
        }
    });
    
    const note = noteQuery.data;
    
    /*  
        Aqui, cuida de pegar a página atual (antes de editar), e o
        termo de pesquisa. O componente NoteForm, serve tanto para
        edição de uma nota como também para criar uma nova nota.
        São dois caminhos de volta diferentes. Quando é nova nota,
        ao voltar atrás, volta para o dashboard, mas quando é para editar
        queremos que ao voltar para trás (ou submeter), volte para a página
        onde estavamos e com a mesma "filtragem que usamos" (o termo de pesquisa).
        Então aqui pega eles da url, porque o NoteForm recebe como props redirectPath
    */
    const searchParams = useSearchParams();
    const page = searchParams.get("page") ?? "1";
    const search = searchParams.get("search") ?? "";
    
    
    if (noteQuery.isLoading)
    {
        return(<EditNoteSkeleton/>);
    }
    
    if (noteQuery.isError)
    {
        return(<p>{noteQuery.error.message}</p>)
    }
    
    
    if (note !== null && note !== undefined)
    {
        return(
            <main className={styles.editNoteContainer}>
                <h1>{note.title}</h1>
                <NoteForm
                    initialData={note}
                    redirectPath={`/notes/${note.id}?page=${page}&search=${search}`}
                />
            </main>
        );
    }
    
    return(<EditNoteSkeleton/>);
}

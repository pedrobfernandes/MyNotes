import { supabase } from "@/lib/supabase/client";
import { FetchNotesResult, FetchNoteResult, NoteMutationResult, InsertNoteType } from "@/types";


export async function fetchNotes(userId: string): Promise<FetchNotesResult>
{
    try
    {
        const { data: fetchData, error: fetchError } = await supabase
            .from("notes")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        
        
        if (fetchError !== null && fetchError !== undefined)
        {
            return({
                data: [],
                error: "Erro ao buscar notas",
                status: "error",
            });
        }

        if (fetchData !== null && fetchData !== undefined &&
            Array.isArray(fetchData) && fetchData.length > 0)
        {
            return({
                data: fetchData,
                error: null,
                status: "success",
            });
        }

        return({
            data: [],
            error: "Sem notas criadas ainda.",
            status: "empty",
        });
    }
    catch (error)
    {
        return({
            data: [],
            error: "Erro de conexão. " +
            "Verifique sua internet ou tente mais tarde.",
            status: "network_error",
        });
    }
}


export async function fetchNoteById(id: string): Promise<FetchNoteResult>
{
    try
    {
        const { data: fetchData, error: fetchError } = await supabase
            .from("notes")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        
        
        if (fetchError !== null && fetchError !== undefined)
        {
            return({
                data: null,
                error: "Erro ao buscar a nota.",
                status: "error",
            });
        }
        
        if (fetchData !== null && fetchData !== undefined)
        {
            return({
                data: fetchData,
                error: null,
                status: "success",
            });
        }
        
        return({
            data: null,
            error: "Nota não existe",
            status: "not_found",
        });
    }
    catch
    {
        return({
            data: null,
            error: "Erro de conexão. " +
            "Verifique sua internet ou tente mais tarde.",
            status: "network_error",
        });
    }
}


export async function insertNote(
    note: InsertNoteType,
    userId: string):
    Promise<NoteMutationResult>
{
    const { title, content } = note;

    try
    {
        const { data: insertData, error: insertError } = await supabase
            .from("notes")
            .insert({
                user_id: userId,
                title: title,
                content: content,
            })
            .select()
            .maybeSingle();
        
        
        if (insertError !== null && insertError !== undefined)
        {
            return({
                data: null,
                error: "Erro ao inserir nova nota.",
                status: "error",
            });
        }

        if (insertData !== null && insertData !== undefined)
        {
            return({
                data: insertData,
                error: null,
                status: "success",
            });
        }

        return({
            data: null,
            error: "Erro desconhecido ao tentar inserir nota.",
            status: "unknown_error",
        });
    }
    catch (error)
    {
        return({
            data: null,
            error: "Erro de conexão. " +
            "Verifique sua internet ou tente mais tarde.",
            status: "network_error",
        });
    }
}


export async function updateNote(
    note: InsertNoteType,
    noteId: string):
    Promise<NoteMutationResult>
{
    const { title, content } = note;
    
    try
    {
        const { data: updatedData, error: updatedError } = await supabase
            .from("notes")
            .update({
                title: title,
                content: content,
                updated_at: new Date().toISOString(),
            })
            .eq("id", noteId)
            .select()
            .maybeSingle();
        
        if (updatedError !== null && updatedError !== undefined)
        {
            return({
                data: null,
                error: "Erro ao atualizar a nota.",
                status: "error",
            });
        }
        
        if (updatedData !== null && updatedData !== undefined)
        {
            return({
                data: updatedData,
                error: null,
                status: "success",
            });
        }
        
        return({
            data: null,
            error: "Erro desconhecido ao tentar atualizar nota.",
            status: "unknown_error",
        });
    }
    catch
    {
        return({
            data: null,
            error: "Erro de conexão. " +
            "Verifique sua internet ou tente mais tarde.",
            status: "network_error",
        });
    }
}


export async function deleteNote(
    noteId: string,):
    Promise<NoteMutationResult>
{
    try
    {
        const { data: deletedData, error: deletedError } = await supabase
            .from("notes")
            .delete()
            .eq("id", noteId)
            .select()
            .maybeSingle();
        
        if (deletedError !== null && deletedError !== undefined)
        {
            return({
                data: null,
                error: "Erro ao deletar nota.",
                status: "error",
            });
        }
            
        if (deletedData !== null && deletedData !== undefined)
        {
            return({
                data: deletedData,
                error: null,
                status: "success",
            });
        }
        
        return({
            data: null,
            error: "Erro desconhecido ao tentar deletar nota.",
            status: "unknown_error",
        });
    }
    catch
    {
        return({
            data: null,
             error: "Erro de conexão. " +
            "Verifique sua internet ou tente mais tarde.",
            status: "network_error",
        });
    }
}

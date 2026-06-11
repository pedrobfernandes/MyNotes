export type Note =
{
    id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
};


export type InsertNoteType =
{
    title: string;
    content: string;
};


type BaseResult =
{
    error: string | null;
    status:
        | "success"
        | "error"
        | "not_created"
        | "network_error";
}

export type FetchNotesResult =
    BaseResult &
{
    data: Note[];
}

export type NoteMutationResult =
    BaseResult &
{
    data: Note | null;
}

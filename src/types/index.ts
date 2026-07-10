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
}


type BaseStatus =
    | "success"
    | "error"
    | "network_error";


type FetchNotesStatus =
    BaseStatus
    | "empty";


type FetchNoteStatus =
    BaseStatus
    | "not_found";


type MutationStatus =
    BaseStatus
    | "unknown_error";


export type FetchNotesResult =
    BaseResult &
{
    data: Note[];
    status: FetchNotesStatus; 
}

export type FetchNoteResult =
    BaseResult &
{
    data: Note | null;
    status: FetchNoteStatus;
}


export type NoteMutationResult =
    BaseResult &
{
    data: Note | null;
    status: MutationStatus;
}

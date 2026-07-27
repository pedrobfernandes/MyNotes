export function normalizeTitle(str: string): string
{
    return (
        str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ç/g, "c")
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9]/g, "")
    );
}


export function normalizeKeyword(str: string): string
{
    return(
        str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]/g, "")
            .trim()
    );
}

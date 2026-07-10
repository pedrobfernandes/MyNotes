export function formatDateTime(date: string): string
{
    return(
        new Date(date).toLocaleString(
            "pt-BR",
            {
                timeZone: "America/Sao_Paulo",
            }
        )
    );
}


export function formatAccessibleDateTime(date: string): string
{
    return(
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                timeZone: "America/Sao_Paulo",
            }
        
        ).format(new Date(date))
    );
}

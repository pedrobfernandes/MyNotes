import { normalizeKeyword } from "./normalize";


export function parseKeywords(input: string): string[]
{
    
    const keywords: string[] = input.trim().split(/\s+/);
    const keywordArray: string[] = [];
    
    for (const keyword of keywords)
    {
        if (keyword.startsWith("#"))
        {
            const normalizedKeyword: string = normalizeKeyword(keyword.slice(1));
                
            
            if (normalizedKeyword !== "")
            {
                keywordArray.push(normalizedKeyword);
            }
        }
    }
    
    const uniqSet: Set<string> = new Set(keywordArray);
    keywordArray.length = 0;
    
    for (const keyword of uniqSet)
    {
        keywordArray.push(keyword);
    }
    
    return(keywordArray);
}


export function formatKeywords(keywords: string[] | null): string
{
    if (keywords == null || keywords.length === 0)
    {
        return("");
    }
    
    const formattedKeywords: string[] = []
    
    for (const keyword of keywords)
    {
        formattedKeywords.push(`#${keyword}`);
    }
    
    return(formattedKeywords.join(" "));
}

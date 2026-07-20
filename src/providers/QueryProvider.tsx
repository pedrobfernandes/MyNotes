"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query/queryClient";


type QueryProviderProps =
{
    children: React.ReactNode;
}


export default function QueryProvider(props: QueryProviderProps)
{
    const { children } = props;
    
    return(
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

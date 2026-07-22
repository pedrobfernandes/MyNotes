"use client";

import { useState, createContext, useContext } from "react";



/*
    Este Context é utilizado apenas para transportar a mensagem
    de confirmação da exclusão de uma nota entre páginas.

    Como após eliminar uma nota existe um redirecionamento para o
    Dashboard, a mensagem precisa sobreviver à navegação para poder
    ser anunciada ao utilizador.
*/
type StatusMessageContextType =
{
    hasDeletedMessage: string;
    setHasDeletedMessage: React.Dispatch<React.SetStateAction<string>>;
};

type StatusMessageProviderProps =
{
    children: React.ReactNode;
}


const StatusMessageContext = createContext<StatusMessageContextType | undefined>(undefined);


export function StatusMessageProvider(props: StatusMessageProviderProps)
{
    const { children } = props;
    const [hasDeletedMessage, setHasDeletedMessage] = useState<string>("");
    
    return(
        <StatusMessageContext.Provider
            value={{
                hasDeletedMessage,
                setHasDeletedMessage,
            }}
        >
            {children}
        </StatusMessageContext.Provider>
    );
}


export function useStatusMessage()
{
    const context = useContext(StatusMessageContext);
    
    if (context === undefined)
    {
        throw new Error("useStatusMessage tem que ser usado dentro de StatusMessageProvider.");
    }
    
    return(context);
}

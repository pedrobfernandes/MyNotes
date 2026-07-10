import { useState, useCallback, useRef, useEffect } from "react";


type Announcer =
{
    // Mensagem atualmente presente na live region.
    // O componente consumidor apenas a renderiza.
    ariaMessage: string;

    // Solicita que uma nova mensagem seja anunciada pelo leitor de tela.
    announce(message: string): Promise<void>;
};

export function useAriaActionStatusAnnouncer(
    initialDelay: number = 150,
    clearDelay: number = 100
): Announcer
{
    // Conteúdo atualmente presente na live region.
    const [ariaMessage, setAriaMessage] = useState<string>("");

    /*
        Guarda o timeout atualmente em execução.

        Como o componente renderiza várias vezes, usamos uma ref para
        manter o mesmo identificador entre renderizações e permitir
        cancelá-lo posteriormente.
    */
    const timeoutRef = useRef<number | null>(null);

    /*
        Identifica qual chamada de announce() é a mais recente.

        Se vários anúncios forem disparados quase ao mesmo tempo,
        apenas o último deverá chegar ao fim. Os anteriores serão
        descartados.
    */
    const latestAnnouncementId = useRef<number>(0);

    const announce = useCallback(async (message: string): Promise<void> =>
    {
        /*
            Cada chamada recebe um identificador único.

            Caso outra chamada aconteça durante a execução desta,
            latestAnnouncementId será incrementado e saberemos que
            este anúncio ficou "obsoleto".
        */
        const currentAnnouncementId = ++latestAnnouncementId.current;

        /*
            Caso exista algum timeout pendente, cancela-o.

            Isso evita que um anúncio iniciado anteriormente continue
            executando enquanto um anúncio mais recente já foi solicitado.
        */
        if (timeoutRef.current !== null)
        {
            clearTimeout(timeoutRef.current);
        }

        /*
            Aguarda um pequeno intervalo antes de iniciar o anúncio.

            Isso dá tempo para o React terminar a renderização e para
            alterações na interface (como fechar um modal ou trocar de
            página) serem refletidas no DOM.
        */
        await new Promise<void>((resolve) =>
        {
            timeoutRef.current = window.setTimeout(resolve, initialDelay);
        });

        /*
            Enquanto aguardávamos, outro anúncio pode ter sido solicitado.

            Se isso aconteceu, este anúncio deixa de ser o mais recente
            e simplesmente encerramos sua execução.
        */
        if (currentAnnouncementId !== latestAnnouncementId.current)
        {
            return;
        }

        /*
            Limpa a live region.

            Isso força uma alteração no DOM mesmo quando a próxima
            mensagem for igual à anterior, aumentando a chance de os
            leitores de tela anunciarem novamente.
        */
        setAriaMessage("");

        /*
            Aguarda um pequeno intervalo para que o React tenha tempo
            de refletir a limpeza da live region no DOM antes de inserir
            a nova mensagem.
        */
        await new Promise<void>((resolve) =>
        {
            timeoutRef.current = window.setTimeout(resolve, clearDelay);
        });

        /*
            Novamente verifica se esta ainda é a chamada mais recente.

            Caso outro anúncio tenha sido solicitado durante a espera,
            este é descartado.
        */
        if (currentAnnouncementId !== latestAnnouncementId.current)
        {
            return;
        }

        // Atualiza a live region com a nova mensagem.
        setAriaMessage(message);

    }, [initialDelay, clearDelay]);

    
    /*
        Ao desmontar o componente, cancela qualquer timeout pendente.

        Isso evita que callbacks tentem executar após o hook ter sido
        desmontado.
    */
    useEffect(() =>
    {
        return(() =>
        {
            if (timeoutRef.current !== null)
            {
                clearTimeout(timeoutRef.current);
            }
        });

    }, []);

    
    return( {ariaMessage, announce } );
}

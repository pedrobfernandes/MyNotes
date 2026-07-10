"use client";


import
{
    createContext, useContext, useState,
    useRef, useEffect,
    type ReactNode

} from "react";


import { createPortal } from "react-dom";
//~ import { registerInfoModalFunctions } from "./InfoModalService";

import "./InfoModalContext.css"



type BaseModal =
{
    type: "alert" | "confirm";
    message: string;
    focusButton?: "primary" | "secondary" | "none";
}

type AlertModal = BaseModal &
{
    type: "alert";
    onClose: () => void;
}

type ConfirmModal = BaseModal &
{
    type: "confirm";
    onConfirm: () => void;
    onCancel: () => void;
    
}


type Modal = AlertModal | ConfirmModal | null;


type InfoModalAlertOptions =
{
    onClose?: () => void | Promise<void>;
};


type InfoModalConfirmOptions =
{
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
    focusButton?: "primary" | "secondary" | "none";
};


type InfoModalContextType =
{
    alert: (message: string, options?: InfoModalAlertOptions ) => Promise<void>;
    confirm: (
        message: string,
        options?: InfoModalConfirmOptions
    ) => Promise<boolean>;
}


const InfoModalContext = createContext<InfoModalContextType | undefined>(undefined);


// Serve para "substituir" o alert() e confirm() nativos
export function InfoModalProvider({ children }: { children: ReactNode })
{
    const [modal, setModal] = useState<Modal>(null);
    const modalRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
    const previousElement: React.RefObject<HTMLElement | null> = useRef<HTMLElement | null>(null);
    
    
    function alert(message: string, options?: InfoModalAlertOptions)
    {
        const { onClose } = options ?? {};
        
        return(
            new Promise<void>((resolve) =>
            {
                setModal({
                    type: "alert",
                    message,
                    onClose: async () =>
                    {
                        setModal(null);
                        resolve();
                        if (onClose) await onClose();
                    }
                });
            })
        );
    }
    
    
    function confirm(
        message: string,
        options?: InfoModalConfirmOptions
    )
    {
        const { onConfirm, onCancel, focusButton = "primary" } = options ?? {};
        
        return(
            new Promise<boolean>((resolve) =>
            {
                setModal({
                    type: "confirm",
                    message,
                    focusButton,
                    onConfirm: async () =>
                    {
                        setModal(null);
                        resolve(true);
                        if (onConfirm) await onConfirm();
                    },
                    onCancel: async () =>
                    {
                        setModal(null);
                        resolve(false);
                        if (onCancel) await onCancel();
                    }
                });
            })
        );
    }
    
    
    
    //~ useEffect(() =>
    //~ {
        //~ registerInfoModalFunctions({ alert, confirm });
    
    //~ }, []);
    
    
    // Bloqueio do scroll e guarda/restaura o foco ao elemento
    // focavel antes de mostrar o modal.
    useEffect(() =>
    {
       if (modal === null)
       {
           return;
       }
       
       const activeElement: Element | null = document.activeElement;
       
       if (activeElement instanceof(HTMLElement))
       {
           previousElement.current = activeElement;
       }
       
       const originalOverflow: string = document.body.style.overflow;
       document.body.style.overflow = "hidden";
       
       return(() =>
       {
           document.body.style.overflow = originalOverflow;
           
           if (previousElement.current !== null
            && document.contains(previousElement.current) === true)
           {
               previousElement.current.focus();
           }
           
           previousElement.current = null;
       });
    
    }, [modal]);
    
    
    // Cuida do foco inicial do modal e dos botões
    useEffect(() =>
    {
        if (modal === null)
        {
            return;
        }
        
        const modalElement: HTMLDivElement | null = modalRef.current;
        
        if (modalElement === null)
        {
            return;
        }
        
        const buttons: NodeListOf<HTMLButtonElement> = modalElement.querySelectorAll("button");
        const primaryButton: HTMLButtonElement = buttons[0];
        const secondaryButton: HTMLButtonElement = buttons[1]
        
        /*
            Aqui, serve para o leitor de tela lêr a mensagem.
            Mas se não passar o foco depois para o botão o
            usuario tem que dar tab. Não gosto. Então mudo
            o foco ao fim de 150 ms. - Descobri que foi erro na minha
            implementação. Mas ainda quero estudar este codigo melhor
            por isso continua aqui.
        */
        //~ modalElement.focus();
        
        if (modal.focusButton !== "none")
        {
            let buttonToFocus: HTMLButtonElement = primaryButton;
                
            if (modal.focusButton === "secondary" && secondaryButton !== null)
            {
                buttonToFocus = secondaryButton;
            }
            
            if (buttonToFocus !== null)
            {
                buttonToFocus.focus();
            }
                       
            //~ const timer = setTimeout(() =>
            //~ {
                //~ let buttonToFocus: HTMLButtonElement = primaryButton;
                
                //~ if (modal.focusButton === "secondary" && secondaryButton !== null)
                //~ {
                    //~ buttonToFocus = secondaryButton;
                //~ }
                
                //~ if (buttonToFocus !== null)
                //~ {
                    //~ buttonToFocus.focus();
                //~ }
            
            //~ }, 150);
        
            //~ return(() => clearTimeout(timer));
        }
    
    }, [modal]);
    
    
    // Esc para fechar
    useEffect(() =>
    {
        if (modal === null)
        {
            return;
        }
        
        function onKeyDown(event: KeyboardEvent)
        {
            if (event.key === "Escape")
            {
                event.preventDefault();
                
                if (modal !== null)
                {
                    if (modal.type === "confirm")
                    {
                        modal.onCancel();
                    }
                //~ else
                //~ {
                    //~ modal.onClose(); // alert nativo fecha com esc ?
                //~ }
                }
            }
        }
        
        
        document.addEventListener("keydown", onKeyDown);
        return(() => document.removeEventListener("keydown", onKeyDown))
    
    }, [modal]);
    
    
    // Cuida de prender o foco no modal.
    useEffect(() =>
    {
        if (modal === null)
        {
            return;
        }

        const modalElement = modalRef.current;
        
        if (modalElement === null)
        {
            return;
        }
        
        // Acho meio que exagero esta. Eu criei este codigo apenas para
        // substituir o alert() e confirm() nativo, mas emfim....
        const focusableElements: NodeListOf<HTMLElement> = modalElement.querySelectorAll<HTMLElement>(
            "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
    
        const firstElement: HTMLElement = focusableElements[0];
        const lastElement: HTMLElement = focusableElements[focusableElements.length - 1];


        function handleTab(event: KeyboardEvent)
        {
            if (event.key !== "Tab")
            {
                return;
            }
            
            if (firstElement === null || lastElement === null)
            {
                return;
            }

            if (event.shiftKey === true)
            {
                if (document.activeElement === firstElement)
                {
                    event.preventDefault();
                    lastElement.focus();
                }
            }
            else
            {
                if (document.activeElement === lastElement)
                {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }

        modalElement.addEventListener("keydown", handleTab);
        return(() => modalElement.removeEventListener("keydown", handleTab));
  
    }, [modal]);
    
    
    
    // Cuida de renderizar os botões
    function renderModalButtons()
    {
        if (modal === null)
        {
            return;
        }
        
        if (modal.type === "alert")
        {
            return(
                <button
                    type="button"
                    onClick={modal.onClose}
                >
                    OK
                </button>
            );
        }
        else
        {
            return(
                <>
                    <button
                        type="button"
                        onClick={modal.onConfirm}
                    >
                        Sim
                    </button>
                    <button
                        type="button"
                        onClick={modal.onCancel}
                    >
                        Não
                    </button>
                </>
            );
        }
    }
    
    
    function renderModal()
    {
        if (modal !== null)
        {
            return(createPortal(
                <div className="infoModal-wrapper">
                    <div className="infoModal-backdrop"></div>
                    <div
                        role={modal.type === "alert" ? "alertdialog" : "dialog"}
                        ref={modalRef}
                        className="infoModal"
                        aria-modal="true"
                        aria-labelledby="title"
                        tabIndex={-1}
                        >
                        <div className="infoModal-content-container">
                            <p className="infoModal-message" id="title">
                                {modal.message}
                            </p>
                            
                            
                            <div className="infoModal-buttons-container">
                                {renderModalButtons()}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            ));
        }
    }
    
    
    return(
        <InfoModalContext.Provider value={{ alert, confirm }}>
            {children}
            {renderModal()}
        </InfoModalContext.Provider>
    );
}


// Assim posso chamar useModal (como hook) em componente
export function useModal()
{
    const context = (useContext(InfoModalContext));
    
    if (context === undefined)
    {
        throw new Error("useModal must be used within an InfoModalProvider");
    }
    
    return(context);
}

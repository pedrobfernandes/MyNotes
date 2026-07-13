"use client";


import { useState, useEffect, useRef } from "react";
import { useNotes } from "@/context/NotesContext";
import { fetchNoteById } from "@/data/notes";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import remarkGfm from "remark-gfm";
import { Note } from "@/types";
import jsPDF from "jspdf";
import { DeleteButton } from "@/components/DeleteButton";
import LoadingSpinner from "@/components/LoadinSpinner";
import { useModal } from "@/context/InfoModalContext";
import html2canvas from "html2canvas";
import styles from "./page.module.css";



type ViewNoteClientProps =
{
    id: string;
};


export default function ViewNoteClient(props: ViewNoteClientProps)
{
    const [note, setNote] = useState<Note | null>(null);
    const [loadMessage, setLoadMessage] = useState<string | null>(null);
    
    const { id } = props;
    
    const searchParams = useSearchParams();
    const page = searchParams.get("page") ?? "1";
    const search = searchParams.get("search") ?? "";
    
    const { notes } = useNotes();
    const { alert } = useModal();
    
    
    const noteContentRef = useRef<HTMLElement | null>(null);
    
    
    async function loadNote(): Promise<void>
    {
        // Aqui idealmente pega as notas do context. Mas caso o usuario por exemplo
        // aperte f5, pega (ou tenta) pegar do supabase
        const contextNote: Note | undefined = notes.find((note) => note.id === id);
        if (contextNote !== undefined)
        {
            setNote(contextNote);
            setLoadMessage(null);
            return;
        }
        
        const dataBaseNote = await fetchNoteById(id);
        if (dataBaseNote.error !== null)
        {
            setLoadMessage(dataBaseNote.error);
            setNote(null);
            return;
        }
        
        setNote(dataBaseNote.data);
        setLoadMessage(null);
    }
    
    
    async function generatePdf(): Promise<jsPDF | undefined>
    {
        if (noteContentRef.current === null)
        {
            return(undefined);
        }
        
        noteContentRef.current.classList.add(styles.pdfExport);
        
        try
        {
            /*
                Cuida de criar um "snapshot" do current (o section)
                coloca escala de 2 para aumentar a resolução
                e a imagem ficar mais "nitida"
            */
            const canvas = await html2canvas(
                noteContentRef.current,
                {
                    scale: 2
                }
            );
            
            // Cuida de "converter" o snapshot em uma imagem
            const imageData = canvas.toDataURL("image/png");
            
            // Cuida de criar um pdf com estas especificações
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });
            
            
            /*
                Pega a largura da pagina PDF, as dimensões originais
                da imagem e calcula a altura proporcional que a imagem
                tem que ter dentro do PDF para manter a proporção original
            */
            const margin = 10;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pageWidth - (margin * 2);
            
            const imageProperties = pdf.getImageProperties(imageData);
            const imageDisplayHeight = (imageProperties.height * contentWidth) / imageProperties.width;
            
            let heightLeft = imageDisplayHeight;
            let position = 0;
            
            pdf.addImage(
                imageData,
                "PNG",
                margin,
                margin,
                contentWidth,
                imageDisplayHeight
            );
            
            heightLeft -= (pageHeight - margin * 2);
            
            
            while (heightLeft > 0)
            {
                position = imageDisplayHeight - heightLeft;
                pdf.addPage();
                
                
                pdf.addImage(
                    imageData,
                    "PNG",
                    margin,
                    margin - position,
                    contentWidth,
                    imageDisplayHeight
                );
                
                heightLeft -= (pageHeight - margin * 2);
            }
            
            
            return(pdf)
        }
        finally
        {
            noteContentRef.current.classList.remove(styles.pdfExport);
        }
    }
    
    
    async function handleDownloadPdf(): Promise<void>
    {
        const pdf = await generatePdf();
        
        if (pdf === undefined)
        {
            await alert("Falha ao gerar o PDF");
            return;
        }
        
        
        // Ou se quiserem moderno e horroroso
        // pdf.save(`${note?.title ?? "nota"}.pdf`)
        if (note !== null)
        {
            pdf.save(`${note.title}.pdf`);
        }
        else
        {
            pdf.save("nota.pdf");
        }

    }
    
    
    async function handleSharePdf(): Promise<void>
    {
        const pdf = await generatePdf();
        
        if (pdf === undefined)
        {
            await alert("Falha ao gerar o PDF");
            return;
        }
        
        const pdfBlob = pdf.output("blob");
        const pdfFile = new File(
            [pdfBlob],
            note !== null
                ? `${note.title}.pdf`
                : "nota.pdf",
            {
                type: "application/pdf",
            }
        );
        
        if (navigator.canShare && navigator.canShare({files: [pdfFile],}))
        {
            await navigator.share({ files: [pdfFile], });
            return;
        }
        
        await alert("O compartilhamento de arquivos não está disponível neste navegador. Utilize o botão 'Baixar PDF'.");
    }
    
    
    useEffect(() =>
    {
        loadNote();
    
    }, [id, notes]);
    
   
    
    useEffect(() =>
    {
        if (note  === null)
        {
            return;
        }
        
        const elementId = sessionStorage.getItem("viewRestoreFocus");
        
        if (elementId === null)
        {
            return;
        }
        
        const element = document.getElementById(elementId);
        
        if (element !== null)
        {
            element.focus();
        }
        
        sessionStorage.removeItem("viewRestoreFocus");
    
    }, [note]);
    
    
    if (loadMessage !== null)
    {
        return(<p>{loadMessage}</p>);
    }
    
    
    if (note !== null)
    {
        return(
            <main className={styles.viewNoteContainer}>
                <article>
                    <header>
                        <h1>{note.title}</h1>
                    </header>
                    <section ref={noteContentRef}>
                        <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {note.content}
                            </ReactMarkdown>
                        </div>
                    </section>
                    <footer>
                        <div className={styles.linkGroup}>
                            <Link
                                id={"edit-note-link"}
                                className={styles.link} href={`/notes/${note.id}/edit?page=${page}&search=${search}`}
                                onClick={() =>
                                {
                                    sessionStorage.setItem(
                                        "viewRestoreFocus",
                                        "edit-note-link"
                                    );
                                }}
                            >
                                Editar
                            </Link>
                            <Link className={styles.link} href={`/dashboard?page=${page}&search=${search}`}>
                                Voltar
                            </Link>
                             <DeleteButton
                                id={id}
                                page={page}
                                search={search}
                            />
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                            >
                                Baixar PDF
                            </button>
                            <button
                                type="button"
                                onClick={handleSharePdf}
                            >
                                Compartilhar
                            </button>
                        </div>
                        
                    </footer>
                </article>
            </main>
        );
    }
    
    return(<LoadingSpinner/>);
}

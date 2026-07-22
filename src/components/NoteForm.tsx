"use client";


import { useRouter } from "next/navigation";
import { useState } from "react";
import { Note, NoteMutationResult } from "@/types";
import { insertNote, updateNote } from "@/data/notes";
import { supabase } from "@/lib/supabase/client";
import {  UserResponse } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAriaActionStatusAnnouncer } from "@/hooks/useAriaActionStatusAnnouncer";
import { useFormFieldValidation } from "@/hooks/useFormFieldValidation";
import FormFieldStatusMessage from "./FormFieldStatusMessage";

import styles from "./NoteForm.module.css";



type NoteFormProps =
{
    initialData?: Note;
    redirectPath: string;
}


export function NoteForm(props: NoteFormProps)
{
    const { initialData, redirectPath } = props;
    
    const router = useRouter();

    
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    
    const queryClient = useQueryClient();
    
    const { ariaMessage, announce } = useAriaActionStatusAnnouncer();
    
    const { error, clearError, focusField, validateText } = useFormFieldValidation();
    
    
    const MARKDOWN_GUIDE_URL: string =
        "https://docs.github.com/" +
        "pt/get-started/writing-on-github/" +
        "getting-started-with-writing-and-formatting-on-github/" +
        "basic-writing-and-formatting-syntax";

    
    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): Promise<void>
    {
        event.preventDefault();
        clearError();
        
        if (validateText(title, "título") === false)
        {
            focusField("title");
            return;
        }
        
        if (validateText(content, "área de texto") === false)
        {
            focusField("content");
            return;
        }
        
        
        if (initialData !== undefined)
        {
            const updatedNote: NoteMutationResult = await updateNote({
                title: title,
                content: content,
            }, initialData.id);
            
            if (updatedNote.error !== null)
            {
                await announce(updatedNote.error);
                return;
            }
            
            void queryClient.invalidateQueries({ queryKey: ["notes"] });
            void queryClient.invalidateQueries({ queryKey: ["note", initialData.id] });
            
        }
        else
        {
            const user: UserResponse = await supabase.auth.getUser();
            if (user.error !== null)
            {
                return;
            }
            
            const insertedNote: NoteMutationResult = await insertNote({
                title: title,
                content: content,
            }, user.data.user.id);
            
            
            if (insertedNote.error !== null)
            {
                await announce(insertedNote.error);
                return;
            }
            
            void queryClient.invalidateQueries({ queryKey: ["notes"] });
        }
        
        await announce(
            initialData !== undefined
                ? "Nota atualizada com sucesso."
                : "Nota criada com sucesso."
        );
        
        router.push(redirectPath);
    }
    
    
    function renderTextOrMarkDown()
    {
        if (previewMode === true)
        {
            return(
                <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            );
        }
        
        return(
            <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
            />
        );
    }
    
    
    async function handleCancel()
    {
        await announce("Cancelado.");
        router.push(redirectPath);
    }
    
    
    return(
        <form
            onSubmit={handleSubmit}
            className={styles.noteForm}
            noValidate
        >
            <div className={styles.inputGroup}>
                <label htmlFor="title">Título</label>
                <input
                    id="title"
                    className={styles.titleInput}
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="content">Conteúdo (Aceita Markdown)</label>
                <div className={styles.inputGroupOptions}>
                    <button
                        className={styles.previewButton}
                        type="button"
                        aria-labelledby="preview-button-description"
                        aria-pressed={previewMode}
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        Alternar Visualização
                    </button>
                    <p className="visually-hidden" id="preview-button-description">
                        Alternar entre o modo de visualização e edição
                    </p>
                    <a
                        className={styles.helpLink}
                        href={MARKDOWN_GUIDE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                       Ajuda Markdown
                    </a>
                </div>
                {renderTextOrMarkDown()}
            </div>
            
            
            <div className={styles.buttonGroup}>
                <button type="submit">
                    Salvar
                </button>
                <button type="button" onClick={handleCancel}>
                    Cancelar
                </button>
            </div>
            
            <FormFieldStatusMessage status={error}/>
            
            <p
                className="visually-hidden"
                aria-live="polite"
                aria-atomic="true"
            >
                {ariaMessage}
            </p>
        </form>
    );
}

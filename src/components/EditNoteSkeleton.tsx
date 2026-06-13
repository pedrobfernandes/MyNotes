import styles from "./EditNoteSkeleton.module.css";


export default function EditNoteSkeleton()
{
    return(
        <div className={styles.editNoteContainer} aria-hidden="true">
            <span className={styles.heading}>Nota</span>
            <div className={styles.noteForm}>
                <div className={styles.inputGroup}>
                    <span>Título</span>
                    <div className={styles.titleInput}/>
                </div>
                <div className={styles.inputGroup}>
                    <span>Conteúdo</span>
                    <div className={styles.inputGroupOptions}>
                        <span className={styles.previewButton}>
                           Escrever
                       </span>
                        <span className={styles.helpLink}>
                            Ajuda
                        </span>
                    </div>
                    <div className={styles.textArea}/>
                </div>
                <div className={styles.buttonGroup}>
                    <span className={styles.saveButton}>Salvar</span>
                    <span className={styles.cancelButton}>Cancelar</span>
                </div>
            </div>
        </div>
    );
}

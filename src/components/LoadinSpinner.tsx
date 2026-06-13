import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner()
{
    return(
        <div className={styles.loadingContainer}>
            <div className={styles.spinner} aria-hidden="true">
                <p>Carregando nota...</p>
            </div>
        </div>
    );
}

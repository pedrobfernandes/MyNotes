import styles from "./NotesSkeleton.module.css";

export default function NotesSkeleton()
{
    return(
        <div
            aria-hidden="true"
            className={styles.skeletonContainer}
        >
            <ul className={styles.notesContainer}>
                {
                    Array.from({ length: 8 }).map((_, index) => (
                        <li
                            key={index}
                            className={styles.skeletonCard}
                        />
                    ))
                }
            </ul>
            <div className={styles.skeletonPagination}>
                <span/>
                <span/>
                <span/>
                <span/>
            </div>
        </div>
    );
}

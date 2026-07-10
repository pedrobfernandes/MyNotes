import styles from "./SearchFormPlaceholder.module.css";

export default function SearchFormPlaceholder()
{
    return(
        <form
            aria-hidden="true"
            className={styles.searchForm}
        >
            <div className={styles.inputSkeleton}/>
            <div className={styles.buttonSkeleton}/>
        </form>
    );
}

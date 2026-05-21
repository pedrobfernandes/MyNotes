import styles from "./SearchForm.module.css";


export default function SearchForm()
{
    return(
        <form className={styles.searchForm}>
            <label htmlFor="search-input" className="visually-hidden">Procure o termo</label>
            <input id="search-input" type="text" placeholder="termo de pesquisa"/>
            <button type="submit">
                Buscar
            </button>
        </form>
    );
}

import { useState, SetStateAction } from "react";
import styles from "./SearchForm.module.css";


type SearchFormProps =
{
    setFilter: React.Dispatch<SetStateAction<string>>;
    setCurrentPage: React.Dispatch<SetStateAction<number>>;
};

export default function SearchForm(props: SearchFormProps)
{
    const { setFilter, setCurrentPage } = props;
    const [searchTerm, setSearchTerm] = useState<string>("");
    
    
    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void
    {
        event.preventDefault();
        setFilter(searchTerm.trim());
        setCurrentPage(1);
        //~ setSearchTerm("");
    }
    
    return(
        <form className={styles.searchForm} onSubmit={handleSubmit}>
            <label htmlFor="search-input" className="visually-hidden">Procure o termo</label>
            <input
                id="search-input"
                type="text"
                placeholder="Termo de pesquisa"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit">
                Buscar
            </button>
        </form>
    );
}

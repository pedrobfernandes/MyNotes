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
    
    
    function handleChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        const value: string = event.target.value;
        setSearchTerm(value);
        
        if (value.trim() === "")
        {
            setFilter("");
        }
    }
    
    
    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void
    {
        event.preventDefault();
        setFilter(searchTerm.trim());
        setSearchTerm(searchTerm.trim());
        setCurrentPage(1);
    }
    
    return(
        <form className={styles.searchForm} onSubmit={handleSubmit}>
            <label htmlFor="search-input" className="visually-hidden">Procure o termo</label>
            <input
                id="search-input"
                type="text"
                placeholder="Termo de pesquisa"
                value={searchTerm}
                onChange={handleChange}
            />
            <button type="submit">
                Buscar
            </button>
        </form>
    );
}

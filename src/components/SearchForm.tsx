import { useState, useEffect } from "react";
import styles from "./SearchForm.module.css";


type SearchFormProps =
{
    filter: string;
    handleSearch: (term: string) => void;
};

export default function SearchForm(props: SearchFormProps)
{
    const { filter, handleSearch } = props;
    const [searchTerm, setSearchTerm] = useState<string>(filter);
    
    
    function handleChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        // Cuida de deixar o filtro como "" caso tenha dado
        // espaços apenas etc.
        const value: string = event.target.value;
        setSearchTerm(value);
        
        if (value.trim() === "")
        {
            handleSearch("");
        }
    }
    
    
    // Prefiro que a busca seja mesmo após apertar o botão ao invéz daquele modelo
    // moderno e chato de digitar e ir filtrando..
    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void
    {
        event.preventDefault();
        handleSearch(searchTerm.trim());
    }
    
    
    
    // Agora não tenho já certeza do que este effect faz aqui..
    // Investigar depois...
    useEffect(() =>
    {
        setSearchTerm(filter);
    
    }, [filter]);
    
    
    
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
            <button
                id="search-button"
                type="submit"
                onClick={() =>
                {
                    sessionStorage.setItem(
                        "restoreFocus",
                        "search-button"
                    );
                }}
            >
                Buscar
            </button>
        </form>
    );
}

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
    const [error, setError] = useState<string>("");
    
    
    function handleChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        // Cuida de deixar o filtro como "" caso tenha dado
        // espaços apenas etc.
        const value: string = event.target.value;
        setSearchTerm(value);
        setError("");
        
        if (value.trim() === "")
        {
            handleSearch("");
        }
    }
    
    function validateSearch(term: string): boolean
    {
        const trimmed = term.trim();
        
        if (trimmed === "")
        {
            return(true);
        }
        
        const words = trimmed.split(/\s+/);
        
        const hasHashtag = words.some(word => word.startsWith("#") === true);
        
        const hasText = words
            .some(word =>
                word.startsWith("#") === false
                && word.length > 0
        );
        
        if (hasHashtag === true && hasText === true)
        {
            setError("Não é permitido misturar palavras chave com pesquisa por termo");
            return(false);
        }
        
        return(true)
    }
    
    
    // Prefiro que a busca seja mesmo após apertar o botão ao invéz daquele modelo
    // moderno e chato de digitar e ir filtrando..
    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>): void
    {
        event.preventDefault();
        
        const trimmed = searchTerm.trim();
        
        if (trimmed === "")
        {
            handleSearch("");
            return;
        }
        
        if (validateSearch(trimmed) === true)
        {
            setError("");
            handleSearch(trimmed);
        }
    }
    
    
    
    // Agora não tenho já certeza do que este effect faz aqui..
    // Investigar depois...
    useEffect(() =>
    {
        setSearchTerm(filter);
        setError("");
    
    }, [filter]);
    
    
    
    return(
        <form onSubmit={handleSubmit}>
            <fieldset className={styles.fieldset}>
                <legend className="visually-hidden">
                    Formulário de pesquisa de notas
                </legend>
            
                <label htmlFor="search-input">
                    Procure por título ou palavras-chave
                </label>
                <div className={styles.searchRow}>
                    <input
                        id="search-input"
                        aria-describedby="search-help"
                        type="text"
                        placeholder="Termo ou #palavra #palavra"
                        value={searchTerm}
                        onChange={handleChange}
                        className={error ? styles.error : ""}
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
                </div>
                <p
                    className={styles.errorMessage}
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {error}
                </p>


                <p id="search-help" className="visually-hidden">
                    Pesquise pelo título ou termos contidos no título,
                    ou por uma ou mais palavras-chave iniciadas pelo
                    símbolo cardinal, separadas por espaços.
                </p>
            </fieldset>
        </form>
    );
}

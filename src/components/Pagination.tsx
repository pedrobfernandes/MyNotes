import { useState } from "react";
import styles from "./Pagination.module.css";


type PaginationProps =
{
    handleNextPage: () => void;
    handlePreviousPage: () => void;
    handleGoToFirstPage: () => void;
    handleGoToLastPage: () => void;
    goToPage: (page: number) => void;
    currentPage: number;
    totalPages: number;
};


export default function Pagination(props: PaginationProps)
{
    const
    {
        handleNextPage, handlePreviousPage,
        handleGoToFirstPage, handleGoToLastPage,
        goToPage, currentPage, totalPages
    } = props;
    
    
    const [pageInput, setPageInput] = useState<string>("");
    
    
    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>)
    {
        event.preventDefault();
        
        let page = Number(pageInput.trim());
        
        // Este á partida não é necessario
        // o pattern do inputNumeric já valida
        // Mas vai ficar mesmo assim.
        if (Number.isNaN(page))
        {
            return;
        }
        
        if (page < 1)
        {
            page = 1;
        }
        
        if (page > totalPages)
        {
            page = totalPages;
        }
        
        goToPage(page);
        setPageInput("");
    }
    
    
    return(
        <div className={styles.paginationContainer}>
            
            <form onSubmit={handleSubmit} className={styles.paginationForm}>
                <label htmlFor="page-input">
                    Ir para página
                </label>
                <div className={styles.paginationInputGroup}>
                    <input
                        id="page-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={pageInput}
                        onChange={(event) =>
                        {
                            setPageInput(event.target.value);
                        }}
                    />
                    <button type="submit">
                        Ir
                    </button>
                </div>
                
            </form>
            
            <div className={styles.paginationButtons}>
                <button
                    type="button"
                    aria-label="Ir para o início"
                    onClick={handleGoToFirstPage}
                    disabled={currentPage === 1 || totalPages === 0}
                >
                    Início
                </button>
                <button
                    type="button"
                    aria-label="Página Anterior"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || totalPages === 0}
                >
                    {"<"}
                </button>
                <span>
                    <span className="visually-hidden">
                        Página {currentPage} de {totalPages}
                    </span>
                    <span aria-hidden="true">
                        {currentPage}/{totalPages}
                    </span>
                </span>
                <button
                    type="button"
                    aria-label="Página Seguinte"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    {">"}
                </button>
                <button
                    type="button"
                    aria-label="Ir para o fim"
                    onClick={handleGoToLastPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Fim
                </button>
            </div>
        </div>
    );
}

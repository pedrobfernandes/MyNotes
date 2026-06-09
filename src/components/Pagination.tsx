import styles from "./Pagination.module.css";


type PaginationProps =
{
    handleNextPage: () => void;
    handlePreviousPage: () => void;
    handleGoToFirstPage: () => void;
    handleGoToLastPage: () => void;
    currentPage: number;
    totalPages: number;
};


export default function Pagination(props: PaginationProps)
{
    const
    {
        handleNextPage, handlePreviousPage,
        handleGoToFirstPage, handleGoToLastPage,
        currentPage, totalPages
    } = props;
    
    
    return(
        <div className={styles.paginationContainer}>
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
            <span
            >
                {currentPage}/{totalPages}
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
    );
}

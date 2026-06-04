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
                aria-label="Ir para a primeira página"
                onClick={handleGoToFirstPage}
                disabled={currentPage === 1 || totalPages === 0}
            >
                Primeira
            </button>
            <button
                type="button"
                aria-label="Página Anterior"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || totalPages === 0}
            >
                Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
                type="button"
                aria-label="Página Seguinte"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
            >
                Próximo
            </button>
            <button
                type="button"
                aria-label="Ir para a última página"
                onClick={handleGoToLastPage}
                disabled={currentPage === totalPages || totalPages === 0}
            >
                Última
            </button>
        </div>
    );
}

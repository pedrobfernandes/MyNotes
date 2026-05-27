import styles from "./Pagination.module.css";


type PaginationProps =
{
    handleNextPage: () => void;
    handlePreviousPage: () => void;
    currentPage: number;
    totalPages: number;
};


export default function Pagination(props: PaginationProps)
{
    const
    {
        handleNextPage, handlePreviousPage,
        currentPage, totalPages
    } = props;
    
    return(
        <div className={styles.paginationContainer}>
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
        </div>
    );
}

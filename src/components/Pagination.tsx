import styles from "./Pagination.module.css";


export default function Pagination()
{
    return(
        <div className={styles.paginationContainer}>
            <button type="button" aria-label="Página Anterior">
                Anterior
            </button>
            <span>Página 1 de 20</span>
            <button type="button" aria-label="Página Seguinte">
                Próximo
            </button>
        </div>
    );
}

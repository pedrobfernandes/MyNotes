import styles from  "./NotesPlaceHolder.module.css";

type NotesPlaceHolderProps =
{
    count: number;
    animated?: boolean;
}


export default function NotesPlaceHolder(props: NotesPlaceHolderProps)
{
    const { count, animated = false } = props;
    
    return(
        <>
            {
                Array.from({ length: count })
                    .map((_, index) => (
                        <li
                            key={index}
                            aria-hidden="true"
                            className={
                                animated
                                    ? `${styles.placeholderCard} ${styles.animated}`
                                    : styles.placeholderCard
                            }
                        />
                    ))
            }
        </>
    );
}

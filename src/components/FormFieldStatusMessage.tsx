import "./FormFieldStatusMessage.module.css";


type FormFieldStatusMessageProps =
{
    status: string;
    className?: string;
};


export default function FormFieldStatusMessage(props: FormFieldStatusMessageProps)
{
    const { status, className = "" } = props;
    
    return(
        <p
            className={`form-field-status-message ${className}`}
            aria-live="assertive"
            aria-atomic="true"
        >
            {status || ""}
        </p>
    );
}

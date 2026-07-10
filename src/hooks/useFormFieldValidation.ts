import { useState } from "react";


type ValidationOptions =
{
    exactLength?: number;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
};


export function useFormFieldValidation()
{
    const [error, setError] = useState<string>("");
    
    
    function validateNumber(value: string, fieldName: string): boolean
    {
        if (value === "" || isNaN(parseFloat(value)) === true)
        {
            setError(`Insira um valor válido para ${fieldName}`);
            return(false);
        }
        
        const numericValue: number = parseFloat(value);
        
        if (numericValue <= 0)
        {
            setError(`O valor de ${fieldName} deve ser maior do que 0`);
            return(false);
        }
        
        return(true);
    }
    
    
    function validateText(value: string, fieldName: string): boolean
    {
        const normalizedText: string = value.trim().replace(/\s+/g, ' ');
        
        if (normalizedText === "")
        {
            setError(`Insira um valor para ${fieldName}`);
            return(false);
        }
        
        return(true);
    }
    
    
    function validateInputTextNumeric(
        value: string,
        fieldName: string,
        options: ValidationOptions = {}
    ): boolean
    {
        const
        {
            exactLength, minLength = 1,
            maxLength = Infinity, required = true
        
        } = options;
        
        const normalizedValue = value.trim();
        
        if (required === true && normalizedValue === "")
        {
            setError(`Insira um valor para ${fieldName}`);
            return(false);
        }
        
        const hasOnlyDigits: RegExp = /^[0-9]+$/;
        
        if (hasOnlyDigits.test(normalizedValue) === false)
        {
            setError(`${fieldName} deve conter apenas números`);
            return(false);
        }
        
        if (exactLength !== undefined && normalizedValue.length !== exactLength)
        {
            setError(`${fieldName} deve ter exatamente ${exactLength} digitos`);
            return(false);
        }
        
        if (normalizedValue.length < minLength)
        {
            setError(`${fieldName} deve ter pelo menos ${minLength} digitos`);
            return(false);
        }
        
        if (normalizedValue.length > maxLength)
        {
            setError(`${fieldName} deve ter no máximo ${maxLength} digitos`);
            return(false);
        }
        
        return(true);
    }
    
    
    function validateEmail(value: string, fieldName: string = "e-mail"): boolean
    {
        const normalizedEmail: string = value.trim().toLowerCase();
        
        if (normalizedEmail === "")
        {
            setError(`Insira um valor para ${fieldName}`);
            return(false);
        }
        
        const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        
        if (emailRegex.test(normalizedEmail) === false)
        {
            setError(`Insira um endereço válido de ${fieldName}`);
            return(false);
        }
        
        return(true)
    }
    
    
    function focusField(fieldId: string, delay: number = 300): void
    {
        setTimeout(() =>
        {
            const focused = document.getElementById(fieldId);
            
            if (focused !== null)
            {
                focused.focus();
            }
        
        }, delay);
    }
    
    
    function clearError(): void
    {
        setError("");
    }

    
    return({
        error, validateNumber, validateText,
        validateEmail, validateInputTextNumeric,
        focusField, clearError
    });
}

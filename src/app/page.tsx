"use client";


import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export default function Auth()
{
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState<boolean>(false);
    
    const router = useRouter();
    
    
    function resetAuthForm(): void
    {
        setEmail("");
        setOtp("");
        setStep("email");
        setLoading(false);
    }
    
    
    async function loadUserSession(): Promise<void>
    {
        try
        {
            const response = await supabase.auth.getSession();
            
            if (response.error !== null)
            {
                return;
            }
            
            const userSession = response.data.session;
            
            if (userSession !== null)
            {
                router.push("/dashboard");
            }
        }
        catch
        {
            console.log("Erro ao carregar sessão");
        }
    }
    
    
    useEffect(() =>
    {
        loadUserSession();
        
    }, []);
    
    
    async function handleSendOtp(
        event: React.SyntheticEvent<HTMLFormElement>):
        Promise<void>
    {
        event.preventDefault();
        setLoading(true);
        
        try
        {
            const { error: sendRequestError } = await supabase.auth.signInWithOtp({ email, });
            
            if (sendRequestError !== null)
            {
                console.log("Erro ao enviar codigo de verificação para o email: " + sendRequestError.message);
            }
            else
            {
                setStep("otp");
            }
        }
        catch
        {
            console.log("Algo deu errado ao enviar o código de verificação para o e-mail.");
        }
        finally
        {
            setLoading(false);
        }
    }
    
    
    async function handleVerifyOtp(
        event: React.SyntheticEvent<HTMLFormElement>):
        Promise<void>
    {
        event.preventDefault();
        setLoading(true);
        
        try
        {
            const { error: otpVerifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: "email",
            });
            
            if (otpVerifyError !== null)
            {
                console.log("Código inválido ou expirado");
            }
            else
            {
                resetAuthForm();
                router.push("/dashboard");
            }
        }
        catch
        {
            console.log("Erro ao verificar código.");
        }
        finally
        {
            setLoading(false);
        }
    }
    
    
    function renderEmailOrOtpForm()
    {
        if (step === "email")
        {
            return(
                <form
                    className="signup-form"
                    onSubmit={handleSendOtp}
                >
                    <label htmlFor="email-input">Endereço de e-mail</label>
                    <input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Aguarde" : "Seguinte"}
                    </button>
                </form>
            );
        }
        else
        {
            return(
                <form
                    className="otp-form"
                    onSubmit={handleVerifyOtp}
                >
                    <label htmlFor="otp-input">
                        Insira o código de 6 digitos enviado para o seu e-mail
                    </label>
                    <input
                        id="otp-input"
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(event) => setOtp(event.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        aria-label="Verificar código para entrar na aplicação"
                    >
                        {loading ? "Verificando..." : "Verificar código"}
                    </button>
                </form>
            );
        }
    }
    
    
    return(
        <section key={step}>
            {renderEmailOrOtpForm()}
        </section>
    );
}

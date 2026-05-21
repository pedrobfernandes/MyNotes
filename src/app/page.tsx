"use client";


import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";


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
                    className={styles.loginForm}
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
                    className={styles.loginForm}
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
        <div className={styles.loginPageWrapper}>
            <main className={styles.loginMain}>
                <h1>MyNotes</h1>
                <p className={styles.appDescription}>
                    Suas notas organizadas em um só lugar.
                </p>
                <section className={styles.formSection} key={step}>
                    {renderEmailOrOtpForm()}
                </section>
            </main>
            <footer className={styles.loginFooter}>
                <p className={styles.authorLink}>
                    <span className={styles.copyright}>&copy; 2026</span>
                    <a
                        href="https://github.com/pedrobfernandes"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Pedro Fernandes
                        (abre em nova aba)
                    </a>
                </p>
            </footer>
        </div>
        
    );
}

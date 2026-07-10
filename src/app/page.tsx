"use client";


import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { NotebookPen } from "lucide-react";
import { useFormFieldValidation } from "@/hooks/useFormFieldValidation";
import FormFieldStatusMessage from "@/components/FormFieldStatusMessage";
import styles from "./page.module.css";


export default function Auth()
{
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [supabaseError, setSupabaseError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [resendMessage, setResendMessage] = useState<string>("");
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    
    
    const {
            error, clearError,
            validateEmail, focusField,
            validateInputTextNumeric
    
    } = useFormFieldValidation();
    
    
    // Guarda a referencia para o timer
    const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    const isFirstRender = useRef<boolean>(true);
    const emailRef = useRef<HTMLInputElement>(null);
    const otpRef = useRef<HTMLInputElement>(null);
    
    const router = useRouter();
    
    
    // Cuida de ver se já tem uma sessão. Se tem
    // manda para o dashboard, se não fica aqui (login)
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
    
    
    // Cuida de "agendar" a limpeza do timer na desmontagem.
    // "Agenda" pois estamos retornando um callback e não executando na hora
    useEffect(() =>
    {
        return(() =>
        {
            if (resendIntervalRef.current !== null)
            {
                clearInterval(resendIntervalRef.current);
            }
        })
    
    }, []);
    
    
    useEffect(() =>
    {
        loadUserSession();
        
    }, []);
    
    
    useEffect(() =>
    {
        if (isFirstRender.current === true)
        {
            isFirstRender.current = false;
            return;
        }
        
        if (step === "email")
        {
            if (emailRef.current !== null)
            {
                emailRef.current.focus();
            }
        }
        
        if (step === "otp")
        {
            if (otpRef.current !== null)
            {
                otpRef.current.focus();
            }
        }
    
    }, [step]);
    
    
    function startResendCooldown()
    {
        if (resendIntervalRef.current !== null)
        {
            clearInterval(resendIntervalRef.current);
        }
        
        setResendCooldown(30);
        
        
        // Cuida de criar o timer, que roda a callback a cada segundo.
        // O ref guarda a referencia do timer para o parar depois.
        resendIntervalRef.current = setInterval(() =>
        {
            // Em cada chamada desta callback pelo timer,
            // atualiza o valor do cooldown e atualiza a interface
            setResendCooldown(previous =>
            {
                if (previous <= 1)
                {
                    if (resendIntervalRef.current !== null)
                    {
                        clearInterval(resendIntervalRef.current);
                        resendIntervalRef.current = null;
                    }
                    
                    return(0);
                }
                
                return(previous - 1);
            });
        
        }, 1000);
    }
    
    
    function handleBackToEmail(): void
    {
        setEmail("");
        setOtp("");
        setSupabaseError("");
        clearError();
        setResendMessage("");
        setResendCooldown(0);
        
        if (resendIntervalRef.current !== null)
        {
            clearInterval(resendIntervalRef.current);
            resendIntervalRef.current = null;
        }
        
        setStep("email");
    }
    
    
    async function handleResendOtp(): Promise<void>
    {
        setLoading(true);
        setSupabaseError("");
        setResendMessage("");
        clearError();
        
        
        try
        {
            const { error: resendRequestError } = await supabase.auth.signInWithOtp({ email });
            
            if (resendRequestError !== null)
            {
                setSupabaseError("Erro ao reenviar código: " + resendRequestError.message);
            }
            else
            {
                setResendMessage("Código reenviado. Verifique seu email.");
                if (otpRef.current !== null)
                {
                    otpRef.current.focus();
                }
                
                startResendCooldown();
            }
        }
        catch
        {
            setSupabaseError("Algo deu errado ao reenviar o código.");
        }
        finally
        {
            setLoading(false);
        }
    }    
    
    
    
    async function handleSendOtp(
        event: React.SyntheticEvent<HTMLFormElement>):
        Promise<void>
    {
        event.preventDefault();
        setLoading(true);
        setSupabaseError("");
        clearError();
        
        
        if (validateEmail(email, "o e-mail") === false)
        {
            focusField("email-input");
            setLoading(false);
            return;
        }
        
        try
        {
            const { error: sendRequestError } = await supabase.auth.signInWithOtp({ email, });
            
            if (sendRequestError !== null)
            {
                setSupabaseError(
                    "Erro ao enviar codigo de" +
                    " verificação para o email: " + sendRequestError.message
                );
            }
            else
            {
                setStep("otp");
            }
        }
        catch
        {
            setSupabaseError(
                "Algo deu errado ao enviar" +
                " o código de verificação para o e-mail."
            );
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
        setSupabaseError("");
        clearError();
        
        
        if (validateInputTextNumeric(otp, "código", { exactLength: 6 }) === false)
        {
            focusField("otp-input");
            setLoading(false);
            return;
        }
        
        try
        {
            const { error: otpVerifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: "email",
            });
            
            if (otpVerifyError !== null)
            {
                setSupabaseError("Código inválido ou expirado");
            }
            else
            {
                router.push("/dashboard");
            }
        }
        catch
        {
            setSupabaseError("Erro ao verificar código.");
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
                    noValidate
                >
                    <label htmlFor="email-input">Endereço de e-mail</label>
                    <input
                        ref={emailRef}
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
                    
                    <FormFieldStatusMessage status={error || supabaseError}/>
                    
                </form>
            );
        }
        else
        {
            return(
                <form
                    className={styles.loginForm}
                    onSubmit={handleVerifyOtp}
                    noValidate
                >
                    <label htmlFor="otp-input">
                        Insira o código de 6 digitos enviado para o seu e-mail
                    </label>
                    <input
                        ref={otpRef}
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
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading || resendCooldown > 0}
                        aria-label="Reenviar código de verificação para o e-mail"
                    >
                        {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : "Reenviar código"}
                    </button>
                    <button
                        type="button"
                        onClick={handleBackToEmail}
                        aria-label="Voltar atrás para a etapa de e-mail"
                    >
                        Voltar
                    </button>
                    
                    <FormFieldStatusMessage status={error || supabaseError || resendMessage}/>
                    
                </form>
            );
        }
    }
    
    
    return(
        <div className={styles.loginPageWrapper}>
            <main className={styles.loginMain}>
                <h1 className={styles.loginHeading}>
                    MyNotes
                    <NotebookPen className={styles.icon}/>
                </h1>
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

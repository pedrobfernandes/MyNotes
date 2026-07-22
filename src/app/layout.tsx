import type { Metadata } from "next";
import {  Geist, Geist_Mono } from "next/font/google";
import { InfoModalProvider } from "@/context/InfoModalContext";
import { StatusMessageProvider } from "@/context/StatusMessageContext";
import QueryProvider from "@/providers/QueryProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
    title:
    {
        default: "MyNotes",
        template: "MyNotes | %s",
    },
    
    description: "Suas notas em um só lugar"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
      <QueryProvider>
            <InfoModalProvider>
                <StatusMessageProvider>{children}</StatusMessageProvider>
            </InfoModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

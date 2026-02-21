import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropGate - Immobilienverwaltungssoftware",
  description: "Moderne cloudbasierte Immobilienverwaltungssoftware",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      {/* Anti-flash: read propgate-theme from localStorage before first paint */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var u=new URLSearchParams(window.location.search).get('theme');var s=localStorage.getItem('propgate-theme');var t=u||s||(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');if(u)localStorage.setItem('propgate-theme',u);document.documentElement.setAttribute('data-theme',t);}catch(e){}})()` }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}

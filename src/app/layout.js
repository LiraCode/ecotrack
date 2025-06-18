import '@/app/styles/globals.css';
import '@/app/styles/awesome/all.css';
import '@/app/styles/awesome/sharp-solid.css';
import React from 'react';

import { Geist, Geist_Mono, Roboto, Cabin_Sketch, Crimson_Pro } from 'next/font/google';
import ClientProviders from './ClientProviders';
import { AuthContextProvider } from '@/context/AuthContext';
import { MetasProvider } from '@/context/metas/MetasContext';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/ThemeProvider';

const cabinSketch = Cabin_Sketch({
  variable: '--font-cabin',
  weight: '400',
  subsets: ['latin'],
  preload: false,
});

const crimsonPro = Crimson_Pro({
  variable: '--font-crimson',
  weight: ['400', '700'],
  subsets: ['latin'],
  preload: false,
});

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children
}) {
  return (
    <html lang="pt-BR" className="theme-transition">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cabinSketch.variable} ${crimsonPro.variable} ${roboto.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <AuthContextProvider>
            <MetasProvider>
              <ClientProviders>
                <main className="min-h-screen">
                  {children}
                </main>
              </ClientProviders>
              <Toaster />
            </MetasProvider>
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

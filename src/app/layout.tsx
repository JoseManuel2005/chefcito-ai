import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext"; // Asegúrate que esta ruta sea correcta

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chefcito AI",
  description: "Tu asistente culinario impulsado por IA",
  icons: {
    icon: [
      { url: '/chef.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' } // fallback para navegadores que no soportan SVG
    ],
    shortcut: '/chef.svg',
    apple: '/chef.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              // Estilos generales
              duration: 4000,
              style: {
                background: '#ffd700',
                color: '#fff',
                padding: '16px 24px',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 20px 60px rgba(255, 215, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.12)',
                maxWidth: '500px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              },
              // Estilos para success
              success: {
                duration: 4000,
                style: {
                  background: '#ffd700',
                  color: '#fff',
                  boxShadow: '0 20px 60px rgba(255, 215, 0, 0.5), 0 8px 20px rgba(0, 0, 0, 0.12)',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ffd700',
                },
              },
              // Estilos para error
              error: {
                duration: 5000,
                style: {
                  background: '#ffd700',
                  color: '#fff',
                  boxShadow: '0 20px 60px rgba(255, 215, 0, 0.5), 0 8px 20px rgba(0, 0, 0, 0.12)',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ffd700',
                },
              },
              // Estilos para loading
              loading: {
                style: {
                  background: '#ffd700',
                  color: '#fff',
                  boxShadow: '0 20px 60px rgba(255, 215, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.12)',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
              },
            }}
            containerStyle={{
              top: 80,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
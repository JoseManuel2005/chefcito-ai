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
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
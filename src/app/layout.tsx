import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import Header from "../components/header/Header";
import NextAuthSessionProvider from "./providers/sessionProvider";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Taskforge Web",
  description: "A modern task workspace powered by a Laravel API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontSans.className}>
        <NextAuthSessionProvider>
          <Header />
          {children}
        </NextAuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}

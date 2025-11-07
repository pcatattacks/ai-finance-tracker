/**
 * Root Layout
 *
 * This is the root layout for the entire application.
 * It wraps all pages and provides:
 * - Inter font family (from PRD design system)
 * - Clerk authentication provider
 * - TanStack Query provider for server state
 * - Theme provider for light/dark mode
 * - Toast notifications
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/query-provider";

// Load Inter font as specified in PRD
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Finance Guru - AI-Powered Personal Finance Tracker",
  description:
    "Track your spending, get AI-powered insights, and achieve your financial goals with privacy-first finance management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>{children}</QueryProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

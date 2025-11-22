import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
    title: "X - Sign in",
    description: "Sign in to X",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider defaultTheme="light" storageKey="app-theme">
            {children}
        </ThemeProvider>
    );
}

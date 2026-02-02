import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ClientLayout } from "@/components/layout/client-layout";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "DomainHunter - Premium Domain Name Generator",
    description:
        "Generate brandable domain names and check availability instantly. Find the perfect domain for your next project.",
    keywords: [
        "domain generator",
        "domain name",
        "brand name",
        "domain availability",
        "domain checker",
    ],
    authors: [{ name: "DomainHunter" }],
    openGraph: {
        title: "DomainHunter - Premium Domain Name Generator",
        description:
            "Generate brandable domain names and check availability instantly.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}

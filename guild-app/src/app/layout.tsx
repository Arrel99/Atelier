import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Atelier — Platform Jasa Kreatif",
  description: "Sistem pemesanan jasa desain berbasis antrean. Transparan, terukur, saling melindungi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--text-primary)]" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

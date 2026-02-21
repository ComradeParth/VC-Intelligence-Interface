import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AppShell from "@/components/layout/app-shell";
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
  title: "VC Intelligence — Sourcing Platform",
  description:
    "AI-powered venture capital deal sourcing and company intelligence platform",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" className="dark">
    <body
      className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
    >
      <AppShell>{children}</AppShell>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "border-border bg-card text-card-foreground",
        }}
      />
    </body>
  </html>
);

export default RootLayout;

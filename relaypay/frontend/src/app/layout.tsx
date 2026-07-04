import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { CursorEffect } from "@/components/providers/CursorEffect";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "NOX - Cross-Chain x402 Settlement Relay",
  description:
    "Cross-chain payment settlement between Base Sepolia / Ethereum and Casper.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-[#050507] text-[#f8fafc]`}
      >
        <CursorEffect />
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}

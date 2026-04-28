import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Fraunces,
  Source_Serif_4,
} from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Field Map — Cold Outreach Discovery",
  description:
    "Drop a pin. Find businesses. Generate pitches. A cartographer's tool for sales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${sourceSerif.variable} h-full`}
    >
      <body className="h-full flex flex-col overflow-hidden">
        <NavBar />
        <div className="flex-1 overflow-auto">{children}</div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Fraunces,
  Source_Serif_4,
} from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ClerkProvider } from "@clerk/nextjs";

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
  title: "Sitelab — Find Businesses Without Websites",
  description:
    "Drop a pin on a map, discover local businesses without websites, and generate personalized pitch emails and cold call scripts with AI. The outreach tool for web design sales reps.",
  metadataBase: new URL("https://field-map.vercel.app"),
  openGraph: {
    title: "Sitelab — Find Businesses Without Websites",
    description:
      "Drop a pin. Find businesses with no website. Generate AI-powered pitches in seconds.",
    siteName: "Sitelab",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sitelab — Find Businesses Without Websites",
    description:
      "Drop a pin. Find businesses with no website. Generate AI-powered pitches in seconds.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${sourceSerif.variable} h-full`}
      >
        <body className="h-full flex flex-col overflow-hidden">
          <NavBar />
          <div className="flex-1 overflow-auto">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}

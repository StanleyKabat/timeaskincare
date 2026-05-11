import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://timeaskincare.sk"),
  title: {
    default: "Timea Skincare - kozmetický salón Nová Baňa",
    template: "%s | Timea Skincare",
  },
  description:
    "Profesionálna a jemná starostlivosť o pleť v Novej Bani. Kozmetické ošetrenia, úprava obočia, laminácia mihalníc a individuálny prístup.",
  keywords: [
    "kozmetický salón Nová Baňa",
    "Timea Skincare",
    "ošetrenie pleti",
    "laminácia obočia",
    "laminácia mihalníc",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Timea Skincare - kozmetický salón Nová Baňa",
    description:
      "Jemná a profesionálna starostlivosť o pleť v Novej Bani.",
    url: "https://timeaskincare.sk",
    siteName: "Timea Skincare",
    locale: "sk_SK",
    type: "website",
    images: [
      {
        url: "/images/timea-logo.png",
        width: 1200,
        height: 630,
        alt: "Timea Skincare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Timea Skincare - kozmetický salón Nová Baňa",
    description: "Jemná a profesionálna starostlivosť o pleť v Novej Bani.",
    images: ["/images/timea-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <Header />
        <main className="pt-[65px] md:pt-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Inter } from "next/font/google";
import { headers } from "next/headers";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HtmlLang } from "@/components/html-lang";
import { siteConfig } from "@/data/site";
import { getLocaleFromPathname } from "@/lib/i18n/config";
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

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin-ext"],
  variable: "--font-brand",
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
    "timeaskincare",
    "timea skincare",
    "kozmetický salón Nová Baňa",
    "Timea Skincare",
    "Timea Polcová",
    "ošetrenie pleti",
    "laminácia obočia",
    "laminácia mihalníc",
  ],
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
        url: "/images/timea-skincare-logo.jpg",
        width: 723,
        height: 723,
        alt: "Timea Skincare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Timea Skincare - kozmetický salón Nová Baňa",
    description: "Jemná a profesionálna starostlivosť o pleť v Novej Bani.",
    images: ["/images/timea-skincare-logo.jpg"],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": "https://timeaskincare.sk/#salon",
  name: siteConfig.name,
  alternateName: ["timeaskincare", "Timea Polcová"],
  url: "https://timeaskincare.sk",
  image: "https://timeaskincare.sk/images/timea-skincare-logo.jpg",
  description:
    "Kozmetický salón Timea Skincare v Novej Bani ponúka ošetrenia pleti, úpravu obočia, lamináciu obočia a mihalníc.",
  telephone: siteConfig.phone,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Štúrova 801/36",
    postalCode: "968 01",
    addressLocality: "Nová Baňa",
    addressCountry: "SK",
  },
  areaServed: ["Nová Baňa", "Žarnovica", "Žiar nad Hronom"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  sameAs: [siteConfig.instagram, siteConfig.facebook, siteConfig.googleBusiness],
  makesOffer: [
    "Kozmetické ošetrenie pleti",
    "Úprava obočia",
    "Laminácia obočia",
    "Laminácia mihalníc",
    "Farbenie mihalníc",
  ].map((name) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name,
    },
  })),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `x-pathname` is set by middleware so we can render the correct server-side
  // `<html lang>` per locale. Falls back to Slovak (the default) if absent.
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const lang = getLocaleFromPathname(pathname);

  return (
    <html lang={lang} className={`${inter.variable} ${cormorant.variable} ${greatVibes.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <HtmlLang />
        <Header />
        <main className="pt-[58px] lg:pt-[68px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

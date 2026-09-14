import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";
import { SwRegister } from "@/components/sw-register";
import { site } from "@/lib/site";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  category: "Agenda de eventos",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "ES-AR",
    "geo.placename": "Huesca",
    "geo.position": "42.139847;-0.408687",
    ICBM: "42.139847, -0.408687",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    url: site.url,
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    site: site.twitterHandle,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
  icons: {
    icon: "/icon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: site.shortName,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  alternateName: `Agenda cultural de ${site.city}`,
  url: site.url,
  inLanguage: "es",
  publisher: {
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/icon.png`,
    sameAs: site.sameAs,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${site.url}/agenda?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: site.name,
  alternateName: `Agenda cultural de ${site.city}`,
  url: site.url,
  logo: `${site.url}/icon.png`,
  email: site.email,
  inLanguage: "es",
  slogan: site.tagline,
  foundingLocation: {
    "@type": "Place",
    name: `${site.city}, España`,
  },
  areaServed: [
    {
      "@type": "City",
      name: site.city,
      url: `${site.url}/agenda`,
      containedInPlace: {
        "@type": "Place",
        name: "Provincia de Huesca",
        address: {
          "@type": "PostalAddress",
          addressLocality: site.city,
          addressRegion: "Huesca",
          addressCountry: "ES",
        },
      },
    },
    {
      "@type": "Place",
      name: "Provincia de Huesca",
    },
  ],
  locationCreated: { "@type": "Place", name: site.city },
  sameAs: site.sameAs,
  contactPoint: {
    "@type": "ContactPoint",
    email: site.email,
    contactType: "customer service",
    availableLanguage: ["es"],
  },
};

const placeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Place",
  name: site.city,
  description: `Agenda cultural y de ocio de ${site.city}: eventos, conciertos, exposiciones, rutas y restaurantes.`,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.city,
    addressRegion: "Huesca",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.139847,
    longitude: -0.408687,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-choco">
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={placeJsonLd} />
        <SwRegister />
        {children}
      </body>
    </html>
  );
}

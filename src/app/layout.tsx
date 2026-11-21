import type { Metadata, Viewport } from "next";
import { Pirata_One, Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Lightbox } from "@/components/layout/Lightbox";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { isIndexingEnabled } from "@/lib/seo/indexing";
import { SITE_URL } from "@/lib/seo/site-url";
import "./globals.css";

const pirata = Pirata_One({
  variable: "--font-pirata",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Temple of Toan | Sacrifice Your Wallet. Receive Toan.",
  description:
    "A devout, condescending publication about guitar tone: the pedals, amps, rigs, and disciples who will spend anything to find it.",
  alternates: {
    canonical: "/",
    types: isIndexingEnabled()
      ? { "application/rss+xml": `${SITE_URL}/rss.xml` }
      : undefined,
  },
  robots: isIndexingEnabled() ? undefined : { index: false, follow: false },
  openGraph: {
    title: "Temple of Toan | Sacrifice Your Wallet. Receive Toan.",
    description:
      "A devout, condescending publication about guitar tone: the pedals, amps, rigs, and disciples who will spend anything to find it.",
    url: SITE_URL,
    siteName: "Temple of Toan",
    images: [
      {
        url: "/images/brand/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Temple of Toan | Sacrifice Your Wallet. Receive Toan.",
    description:
      "A devout, condescending publication about guitar tone: the pedals, amps, rigs, and disciples who will spend anything to find it.",
    images: ["/images/brand/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0909",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pirata.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="font-body flex min-h-full flex-col">
        <a
          href="#main-content"
          className="focus:bg-bone focus:text-abyss sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Lightbox />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist_Mono, Mona_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/site-url";
import { getSite } from "@/lib/data";
import "./globals.css";

const mona = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const v = site.local?.verification ?? {};
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Commercial Electrical Contractor in Southwest Florida | Fortune Electrical",
      template: "%s | Fortune Electrical",
    },
    description:
      "Fortune Electrical Construction is a commercial electrical contractor in Fort Myers serving Southwest Florida — aviation, education, government, senior living and multifamily projects.",
    applicationName: "Fortune Electrical Construction",
    openGraph: { type: "website", siteName: "Fortune Electrical Construction", locale: "en_US" },
    twitter: { card: "summary_large_image" },
    // Hidden from search engines until the site is live on fortuneelectrical.com.
    robots: ALLOW_INDEXING ? undefined : { index: false, follow: false },
    verification: {
      google: v.google || undefined,
      other: v.bing ? { "msvalidate.01": v.bing } : undefined,
    },
    other: { "geo.region": "US-FL", "geo.placename": "Fort Myers" },
  };
}

export const viewport: Viewport = {
  themeColor: "#07090d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mona.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Enables scroll-reveal styles only when JS is running. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

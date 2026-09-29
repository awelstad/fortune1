import type { Metadata, Viewport } from "next";
import { Geist_Mono, Mona_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fortune Electrical Construction | Commercial Electrical Contractor in Florida",
    template: "%s | Fortune Electrical Construction",
  },
  description:
    "Fortune Electrical Construction is a Florida commercial electrical contractor delivering aviation, education, government, senior living and multifamily projects.",
  applicationName: "Fortune Electrical Construction",
  openGraph: { type: "website", siteName: "Fortune Electrical Construction", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

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
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}

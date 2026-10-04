import type { Metadata } from "next";
import { Inter, Cinzel, Abril_Fatface, Syncopate } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const abrilFatface = Abril_Fatface({
  weight: "400",
  variable: "--font-abril",
  subsets: ["latin"],
});

const syncopate = Syncopate({
  weight: ["400", "700"],
  variable: "--font-syncopate",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hrishav.frames | Photography Portfolio",
  description:
    "At eighteen, I'm a photography enthusiast driven by passion rather than profession. Shooting with a Nikon D3400 since 2017. Member of the Jaypee Photographic Enthusiasts Guild at JIIT Noida.",
  keywords: ["photography", "portfolio", "Nikon D3400", "JPEG JIIT", "Noida", "hrishav.frames"],
  openGraph: {
    title: "hrishav.frames | Photography Portfolio",
    description:
      "At eighteen, I'm a photography enthusiast driven by passion rather than profession. Member of the Jaypee Photographic Enthusiasts Guild at JIIT Noida.",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { ContentProtection } from "@/components/ui/content-protection";
import { Preloader } from "@/components/ui/preloader";
import { CursorManager } from "@/components/ui/cursor-manager";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} ${abrilFatface.variable} ${syncopate.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bodoni+Moda:ital,opsz,wght@0,6..72,400..900;1,6..72,400..900&family=Cinzel:wght@400..900&family=Krona+One&family=Syncopate:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-black text-white antialiased font-sans">
        <Preloader />
        <CursorManager />
        <ContentProtection />
        {children}
      </body>
    </html>
  );
}

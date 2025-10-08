import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "devtools.io · Frictionless developer utilities",
  description:
    "A dark-first, client-side toolbox delivering 50 daily-driver utilities with instant performance and absolute privacy.",
  openGraph: {
    title: "devtools.io · Frictionless developer utilities",
    description:
      "A web-native developer toolbox inspired by premium native apps—zero onboarding, command palette core, and 100% client-side.",
    url: "https://devtools.io",
    siteName: "devtools.io",
    images: [
      {
        url: "https://devtools.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "devtools.io workspace preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "devtools.io · Frictionless developer utilities",
    description:
      "Instant, private, and beautifully crafted tools for developers. 50 utilities at launch with a command palette at the core.",
    creator: "@devtools_io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

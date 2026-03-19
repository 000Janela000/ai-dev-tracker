import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Dev Tracker",
    template: "%s | AI Dev Tracker",
  },
  description:
    "Real-time dashboard tracking AI developments relevant to software development. Summaries-first, drill-down on demand.",
  keywords: [
    "AI",
    "artificial intelligence",
    "developer tools",
    "machine learning",
    "LLM",
    "software development",
    "AI news",
  ],
  authors: [{ name: "AI Dev Tracker" }],
  openGraph: {
    title: "AI Dev Tracker",
    description:
      "Real-time dashboard tracking AI developments for software engineers",
    type: "website",
    siteName: "AI Dev Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Dev Tracker",
    description:
      "Real-time dashboard tracking AI developments for software engineers",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

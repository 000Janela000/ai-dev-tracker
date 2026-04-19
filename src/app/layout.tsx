import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DevNews — the AI developer's briefing",
    template: "%s · DevNews",
  },
  description:
    "A daily briefing of AI developments that matter to people who build software. Summaries first, drill-down on demand.",
  keywords: [
    "AI",
    "developer tools",
    "LLM",
    "Claude",
    "GPT",
    "AI coding",
    "MCP",
    "agents",
    "AI news",
  ],
  authors: [{ name: "DevNews" }],
  openGraph: {
    title: "DevNews",
    description: "A daily briefing of AI developments that matter to people who build software.",
    type: "website",
    siteName: "DevNews",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevNews",
    description: "A daily briefing of AI developments that matter to people who build software.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1c20" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-fraunces), serif",
                fontSize: "14px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenSafetyBrief",
  description: "Your open-source safety briefing solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <p className="text-center text-xs text-muted-foreground fixed bottom-4 left-0 right-0">
            OpenSafetyBrief AGPLV3 Licensed -{" "}
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
            </a>
          </p>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

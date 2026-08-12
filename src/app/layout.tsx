import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevPulse — Uptime monitoring for solo developers",
  description:
    "Know the moment your project goes down. Uptime monitoring built for solo developers — simple to set up, and free to use even once you're making money.",
  keywords: [
    "uptime monitoring",
    "solo developer",
    "indie hacker",
    "website monitoring",
    "downtime alerts",
    "free monitoring",
  ],
  openGraph: {
    title: "DevPulse — Uptime monitoring for solo developers",
    description:
      "Know the moment your project goes down. Simple uptime monitoring, free to use even for commercial projects.",
    type: "website",
    siteName: "DevPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPulse — Uptime monitoring for solo developers",
    description:
      "Know the moment your project goes down. Simple uptime monitoring, free to use even for commercial projects.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

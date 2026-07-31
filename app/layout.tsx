import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geist = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", base).toString();

  return {
    title: "Open Signal — An interactive product spec for Suno",
    description:
      "A playable mobile-first product specification for precise human contribution, contextual review, and rights-aware creative credit on Suno.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Open Signal — An interactive product spec for Suno",
      description:
        "Ask for one precise take, review it in context, choose what ships, and preserve rights-aware credit for who made it.",
      type: "website",
      images: [{ url: socialImage, width: 1731, height: 909 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Open Signal — An interactive product spec for Suno",
      description:
        "A playable mobile product specification for human contribution, contextual review, and creator credit on Suno.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${newsreader.variable}`}>
        {children}
      </body>
    </html>
  );
}

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
      "An interactive mobile-first product specification for directed music collaboration, durable credit, and human creative reputation on Suno.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Open Signal — An interactive product spec for Suno",
      description:
        "Explore a proposed mobile workflow for directed contribution, playable comparison, durable credit, and human creative reputation.",
      type: "website",
      images: [{ url: socialImage, width: 1731, height: 909 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Open Signal — An interactive product spec for Suno",
      description:
        "A playable mobile product specification for directed collaboration and human creative reputation on Suno.",
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

import type React from "react";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryWrapper from "@/components/wrapper/QueryWrapper";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

const _poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AIVR - Animal Identification and Vaccination Recording",
  description: "Animal tagging and vaccination data collection system",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  generator: "v0.app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased w-screen h-screen overflow-hidden ${_poppins.className} `}
      >
        <QueryWrapper>
          <Suspense>
            {children}
            <Toaster />
          </Suspense>
        </QueryWrapper>
      </body>
    </html>
  );
}

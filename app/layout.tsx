import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";
import { Suspense } from "react";
import RouteScrollManager from "@/components/layout/RouteScrollManager";
import "./globals.css";
import "@/lib/env";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const display = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Homeland",
  description: "Verified Nigerian real estate marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Suspense fallback={null}>
          <RouteScrollManager />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HoopSpot",
  description: "KrepÅinio veiklÅ³ rezervavimo platforma",
};

export default function RootLayout({ children }) {
  return (
    <html lang="lt" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body><Navigation />{children}</body>
    </html>
  );
}



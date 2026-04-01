import type { Metadata } from "next";
import { Bangers, Noto_Sans_JP, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import NavigationDrawer from "@/components/NavigationDrawer";
import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";

const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers" });
const notoSansJP = Noto_Sans_JP({ weight: ["400", "700", "900"], subsets: ["latin"], variable: "--font-noto" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MangaVerse - Working Manga Platform",
  description: "Read & Create Manga! Upload your manga and share with millions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} ${bangers.variable} ${notoSansJP.variable}`}>
        <div className="speed-lines"></div>
        <Toast />
        
        <Header />
        <NavigationDrawer />

        <div className="container mx-auto pb-20 lg:pb-0">
          {children}
        </div>

        <footer>
          <div className="footer-logo">MANGAVERSE</div>
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/">Popular</a>
            <a href="/upload">Upload</a>
            <a href="/bookmarks">Bookmarks</a>
          </div>
          <p className="copyright">© 2026 MangaVerse - Working Manga Platform</p>
        </footer>

        <BottomNav />
      </body>
    </html>
  );
}

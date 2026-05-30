import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EditProvider } from "@/components/EditProvider";
import SiteHeader from "@/components/SiteHeader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const title = "Álbum Copa 2026 ⚽";
const description =
  "Minha coleção de figurinhas da Copa do Mundo 2026 — o que tenho, o que falta e minhas repetidas pra trocar.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Álbum Copa 2026",
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-full flex flex-col">
        <EditProvider>
          <SiteHeader />
          {children}
        </EditProvider>
      </body>
    </html>
  );
}

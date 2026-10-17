import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { BannerData } from "@/components/shared/BannerData";
import { DaftarkanSW } from "@/components/shared/DaftarkanSW";
import { EfekGlobal } from "@/components/shared/EfekGlobal";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { tanggalAcuan } from "@/lib/data";
import { DISCLAIMER, NAMA_SITUS, SKRIP_MODE, URL_SITUS } from "@/lib/konten";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jbMono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITUS),
  title: {
    default: `${NAMA_SITUS} — baca saham IDX dengan bahasa sederhana`,
    template: `%s | ${NAMA_SITUS}`,
  },
  description:
    "Web app gratis untuk membaca saham Bursa Efek Indonesia. Mode Pemula menjelaskan angka dengan bahasa sederhana; Mode Pro menyediakan candlestick, indikator teknikal, dan screener.",
  applicationName: NAMA_SITUS,
  openGraph: { siteName: NAMA_SITUS, locale: "id_ID", type: "website" },
  other: { disclaimer: DISCLAIMER },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${jbMono.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIP_MODE }} />
      </head>
      <body className="flex min-h-full flex-col">
        <div className="ambient" aria-hidden>
          <div className="ambient-grid" />
          <div className="ambient-orb" data-orb="1" style={{ width: "60vmax", height: "60vmax", left: "-20vmax", top: "-30vmax" }} />
          <div className="ambient-orb" data-orb="2" style={{ width: "42vmax", height: "42vmax", right: "-14vmax", top: "8vmax", opacity: 0.7 }} />
        </div>
        <a
          href="#isi"
          className="sr-only-x focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-black"
        >
          Lewati ke konten
        </a>
        <Header />
        <BannerData tanggalData={tanggalAcuan()} />
        <main id="isi" className="w-full flex-1 px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
          {children}
        </main>
        <Footer />
        <DaftarkanSW />
        <Suspense fallback={null}>
          <EfekGlobal />
        </Suspense>
      </body>
    </html>
  );
}

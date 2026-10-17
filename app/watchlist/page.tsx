import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import { DaftarWatchlist } from "@/components/shared/DaftarWatchlist";
import { semuaRingkas } from "@/lib/data";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Daftar saham pantauanmu, tersimpan di browser tanpa perlu login.",
  robots: { index: false },
};

export default function HalamanWatchlist() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <KepalaHalaman nomor="08" label="Watchlist" judul="Watchlist">
        <p className="teks-pengantar">Tersimpan di browser ini.</p>
      </KepalaHalaman>
      <DaftarWatchlist data={semuaRingkas()} />
    </div>
  );
}

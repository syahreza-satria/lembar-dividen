import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import { Kalkulator } from "@/components/shared/Kalkulator";
import { semuaRingkas } from "@/lib/data";

export const metadata: Metadata = {
  title: "Kalkulator saham: fee, dividen, average down",
  description: "Hitung fee beli dan jual saham, simulasi dividen dari jumlah lot, dan harga rata-rata saat average down.",
};

export default function HalamanKalkulator() {
  const saham = semuaRingkas()
    .map((s) => ({ kode: s.kode, nama: s.nama, harga: s.harga, dpsSetahun: s.dpsSetahun }))
    .sort((a, b) => a.kode.localeCompare(b.kode));
  return (
    <div className="space-y-10 lg:space-y-14">
      <KepalaHalaman nomor="05" label="Kalkulator" judul="Kalkulator">
        <p className="teks-pengantar">
          Fee transaksi, simulasi dividen, dan harga rata-rata.
        </p>
      </KepalaHalaman>
      <Kalkulator saham={saham} />
    </div>
  );
}

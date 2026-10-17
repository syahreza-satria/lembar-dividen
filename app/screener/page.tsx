import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import { Screener } from "@/components/shared/Screener";
import { semuaRingkas } from "@/lib/data";

export const metadata: Metadata = {
  title: "Screener saham IDX",
  description:
    "Saring saham IDX dengan preset siap pakai (Mode Pemula) atau filter bebas fundamental dan teknikal seperti RSI, PER, dan golden cross (Mode Pro).",
};

export default function HalamanScreener() {
  const data = semuaRingkas();
  const sektor = [...new Set(data.map((s) => s.sektor))].sort();
  return (
    <div className="space-y-10 lg:space-y-14">
      <KepalaHalaman nomor="03" label="Screener" judul="Screener">
        <p className="hanya-pemula teks-pengantar">
          Pilih preset untuk melihat saham yang cocok.
        </p>
        <p className="hanya-pro teks-pengantar">
          Semua syarat berlaku bersamaan. Saham dengan n/a pada field yang disyaratkan tidak ikut.
        </p>
      </KepalaHalaman>
      <Screener data={data} sektor={sektor} />
    </div>
  );
}

import type { Metadata } from "next";
import { Istilah } from "@/components/shared/Istilah";
import { KalenderDividen } from "@/components/shared/KalenderDividen";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import { semuaDividen, semuaRingkas, tanggalAcuan } from "@/lib/data";
import { tanggal } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kalender dividen saham IDX",
  description: "Jadwal cum date, ex date, dan tanggal bayar dividen saham IDX per bulan, lengkap dengan dividen per lembar dan yield.",
};

export default function HalamanDividen() {
  const acuan = tanggalAcuan();
  const sektor = new Map(semuaRingkas().map((s) => [s.kode, s.sektor]));
  const data = semuaDividen().map((d) => ({ ...d, sektor: sektor.get(d.kode) ?? "Lainnya" }));

  return (
    <div className="space-y-10 lg:space-y-14">
      <KepalaHalaman nomor="04" label="Kalender dividen" judul="Kalender dividen">
        <p className="teks-pengantar">
          Berdasarkan <Istilah k="ex-date">ex date</Istilah>. Data per {tanggal(acuan)}.
        </p>
      </KepalaHalaman>
      <KalenderDividen data={data} acuan={acuan} />
      <p className="text-sm text-teks-2">
        *Cum date: perkiraan satu hari bursa sebelum ex date (libur bursa tidak dihitung). Tanggal bayar belum tersedia di sumber data.
        Jadwal yang tampil berasal dari riwayat 12 bulan terakhir dan yang sudah tercatat di sumber.
      </p>
    </div>
  );
}

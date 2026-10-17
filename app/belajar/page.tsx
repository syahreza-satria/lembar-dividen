import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import Link from "next/link";
import { GLOSARIUM } from "@/lib/glosarium";

export const metadata: Metadata = {
  title: "Belajar: glosarium istilah saham",
  description: "Penjelasan bahasa sederhana untuk istilah saham seperti PER, PBV, ROE, dividend yield, RSI, MACD, dan golden cross.",
};

export default function Glosarium() {
  const urut = [...GLOSARIUM].sort((a, b) => a.istilah.localeCompare(b.istilah, "id"));
  return (
    <div className="space-y-10 lg:space-y-14">
      <KepalaHalaman nomor="06" label="Glosarium" judul="Belajar istilah saham">
        <p className="teks-pengantar">
          {urut.length} istilah saham, lengkap dengan contoh.
        </p>
      </KepalaHalaman>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {urut.map((g) => (
          <li key={g.slug}>
            <Link href={`/belajar/${g.slug}`} className="kartu gh-kartu block h-full p-4">
              <span className="block font-judul text-base font-semibold">{g.istilah}</span>
              <span className="mt-1 block text-sm text-teks-2">{g.ringkas}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import Link from "next/link";
import { HargaLive, PerubahanLive } from "@/components/shared/HargaLive";
import { TombolWatchlist } from "@/components/shared/TombolWatchlist";
import { semuaRingkas } from "@/lib/data";
import { kali, persen } from "@/lib/format";

export const metadata: Metadata = {
  title: "Daftar saham IDX",
  description: "Daftar saham Bursa Efek Indonesia yang tercakup di Lembar Dividen, dikelompokkan per sektor.",
};

export default function DaftarSaham() {
  const per = new Map<string, ReturnType<typeof semuaRingkas>>();
  for (const s of semuaRingkas()) per.set(s.sektor, [...(per.get(s.sektor) ?? []), s]);
  const sektor = [...per.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-10 lg:space-y-14">
      <KepalaHalaman nomor="02" label="Daftar saham" judul="Daftar saham">
        <p className="teks-pengantar">{semuaRingkas().length} saham per sektor.</p>
      </KepalaHalaman>
      {sektor.map(([nama, daftar]) => (
        <section key={nama} aria-labelledby={`s-${nama}`}>
          <h2 id={`s-${nama}`} className="judul-seksi mb-3">
            {nama}
          </h2>
          <div className="kartu overflow-x-auto">
            <table className="tabel">
              <thead>
                <tr>
                  <th scope="col" className="w-10"><span className="sr-only-x">Watchlist</span></th>
                  <th scope="col">Kode</th>
                  <th scope="col">Nama</th>
                  <th scope="col" className="kanan">Harga</th>
                  <th scope="col" className="kanan">Hari ini</th>
                  <th scope="col" className="kanan">PER</th>
                  <th scope="col" className="kanan">Yield</th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((s) => (
                  <tr key={s.kode}>
                    <td className="!py-1"><TombolWatchlist kode={s.kode} kecil /></td>
                    <td className="angka font-semibold">
                      <Link href={`/saham/${s.kode}`} className="underline-offset-4 gh-teks hover:underline">
                        {s.kode}
                      </Link>
                    </td>
                    <td className="max-w-[18rem] truncate text-teks-2">{s.nama}</td>
                    <td className="kanan"><HargaLive kode={s.kode} fallback={s.harga} className="angka" /></td>
                    <td className="kanan"><PerubahanLive kode={s.kode} fallback={s.perubahanPersen} /></td>
                    <td className="angka kanan">{kali(s.fundamental.per, 1)}</td>
                    <td className="angka kanan">{persen(s.fundamental.dy, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

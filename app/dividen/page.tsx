import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import Link from "next/link";
import { Istilah } from "@/components/shared/Istilah";
import { semuaDividen, tanggalAcuan, type ItemDividen } from "@/lib/data";
import { hariKerjaSebelum, namaBulan, persen, rupiah, tanggal } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kalender dividen saham IDX",
  description: "Jadwal cum date, ex date, dan tanggal bayar dividen saham IDX per bulan, lengkap dengan dividen per lembar dan yield.",
};

function Tabel({ item, acuan }: { item: ItemDividen[]; acuan: string }) {
  return (
    <div className="kartu overflow-x-auto">
      <table className="tabel">
        <thead>
          <tr>
            <th scope="col">Saham</th>
            <th scope="col"><Istilah k="cum-date">Cum date*</Istilah></th>
            <th scope="col"><Istilah k="ex-date">Ex date</Istilah></th>
            <th scope="col"><Istilah k="tanggal-bayar">Tanggal bayar</Istilah></th>
            <th scope="col" className="kanan">Per lembar</th>
            <th scope="col" className="kanan">Setara harga</th>
          </tr>
        </thead>
        <tbody>
          {item.map((d) => (
            <tr key={`${d.kode}${d.ex}`}>
              <td>
                <Link href={`/saham/${d.kode}`} className="angka font-semibold gh-teks hover:underline">
                  {d.kode}
                </Link>
              </td>
              <td className="text-teks-2">{tanggal(hariKerjaSebelum(d.ex))}</td>
              <td>
                {tanggal(d.ex)}
                {d.ex >= acuan && <span className="chip chip-sukses ml-2">Akan datang</span>}
              </td>
              <td className="text-teks-2">{d.bayar ? tanggal(d.bayar) : "Belum tersedia"}</td>
              <td className="angka kanan">{rupiah(d.nilai, d.nilai % 1 ? 2 : 0)}</td>
              <td className="angka kanan text-teks-2">{persen(d.yieldPersen, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KalenderDividen() {
  const acuan = tanggalAcuan();
  const semua = semuaDividen();
  const mendatang = semua.filter((d) => d.ex >= acuan);
  const riwayat = semua.filter((d) => d.ex < acuan);

  const perBulan = new Map<string, ItemDividen[]>();
  for (const d of [...riwayat].reverse()) {
    const b = d.ex.slice(0, 7);
    perBulan.set(b, [...(perBulan.get(b) ?? []), d]);
  }

  return (
    <div className="space-y-10 lg:space-y-14">
      <KepalaHalaman nomor="04" label="Kalender dividen" judul="Kalender dividen">
        <p className="teks-pengantar">
          Berdasarkan <Istilah k="ex-date">ex date</Istilah>. Data per {tanggal(acuan)}.
        </p>
        <nav aria-label="Lompat ke bulan" className="mt-4 flex flex-wrap gap-2">
          {mendatang.length > 0 && <a href="#mendatang" className="chip">Akan datang</a>}
          {[...perBulan.keys()].map((b) => (
            <a key={b} href={`#b-${b}`} className="chip">
              {namaBulan(b)}
            </a>
          ))}
        </nav>
      </KepalaHalaman>

      <section id="mendatang" aria-labelledby="h-mendatang" className="space-y-3">
        <h2 id="h-mendatang" className="judul-seksi">Akan datang</h2>
        {mendatang.length ? (
          <Tabel item={mendatang} acuan={acuan} />
        ) : (
          <p className="kartu p-4 text-sm text-teks-2">
            Belum ada ex date setelah {tanggal(acuan)}.
          </p>
        )}
      </section>

      {[...perBulan.entries()].map(([bulan, item]) => (
        <section key={bulan} id={`b-${bulan}`} aria-labelledby={`h-${bulan}`} className="space-y-3">
          <h2 id={`h-${bulan}`} className="judul-seksi">{namaBulan(bulan)}</h2>
          <Tabel item={item} acuan={acuan} />
        </section>
      ))}

      <p className="text-sm text-teks-2">
        *Cum date: perkiraan satu hari bursa sebelum ex date (libur bursa tidak dihitung). Tanggal bayar belum tersedia di sumber data.
      </p>
    </div>
  );
}

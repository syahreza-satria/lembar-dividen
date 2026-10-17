"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { animasiMasuk, useGSAP } from "@/lib/animasi";
import type { RingkasSaham } from "@/lib/data";
import { angka, kali, persen } from "@/lib/format";
import { FIELD_MAP, urutkan, type Filter, type KunciField } from "@/lib/screener";
import { Istilah } from "./Istilah";
import { Perubahan } from "./Perubahan";
import { TombolWatchlist } from "./TombolWatchlist";

type Kolom = { kunci: KunciField; tampil: (s: RingkasSaham) => string };

const SEMUA_KOLOM: Kolom[] = [
  { kunci: "per", tampil: (s) => kali(s.fundamental.per, 1) },
  { kunci: "pbv", tampil: (s) => kali(s.fundamental.pbv, 2) },
  { kunci: "roe", tampil: (s) => persen(s.fundamental.roe, 1) },
  { kunci: "der", tampil: (s) => kali(s.fundamental.der, 2) },
  { kunci: "dy", tampil: (s) => persen(s.fundamental.dy, 1) },
  { kunci: "rsi14", tampil: (s) => angka(s.indikator.rsi14, 0) },
  { kunci: "rasioVolume", tampil: (s) => kali(s.rasioVolume, 1) },
  { kunci: "jarakMa50", tampil: (s) => (s.jarakMa50 === null ? "n/a" : `${s.jarakMa50 > 0 ? "+" : s.jarakMa50 < 0 ? "−" : ""}${angka(Math.abs(s.jarakMa50), 1)}%`) },
];

/** Tabel hasil yang bisa diurutkan. `kolom` memilih kolom metrik yang ditampilkan di samping kolom dasar. */
export function TabelHasil({
  data,
  kolom,
  urutAwal,
}: {
  data: RingkasSaham[];
  kolom: KunciField[];
  urutAwal: Filter["urut"];
}) {
  const [urut, setUrut] = useState<Filter["urut"]>(urutAwal);
  const terurut = useMemo(() => urutkan(data, urut), [data, urut]);
  const wadah = useRef<HTMLDivElement>(null);
  const tampilKolom = SEMUA_KOLOM.filter((k) => kolom.includes(k.kunci));

  useGSAP(
    () => {
      const baris = wadah.current?.querySelectorAll("tbody tr");
      if (baris?.length) animasiMasuk(Array.from(baris).slice(0, 14), { y: 8, duration: 0.3, stagger: 0.025 });
    },
    { dependencies: [terurut], scope: wadah },
  );

  const ganti = (kunci: Filter["urut"]["kunci"]) =>
    setUrut((u) => (u.kunci === kunci ? { kunci, arah: u.arah === "naik" ? "turun" : "naik" } : { kunci, arah: kunci === "kode" ? "naik" : "turun" }));

  const kepala = (kunci: Filter["urut"]["kunci"], isi: React.ReactNode, kanan = true) => (
    <th
      key={kunci}
      scope="col"
      className={kanan ? "kanan" : ""}
      aria-sort={urut.kunci === kunci ? (urut.arah === "naik" ? "ascending" : "descending") : "none"}
    >
      <button type="button" onClick={() => ganti(kunci)} className="inline-flex items-center gap-1 uppercase tracking-[0.5px] gh-teks">
        {isi}
        <span aria-hidden className="w-3 text-aksen">{urut.kunci === kunci ? (urut.arah === "naik" ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );

  if (!terurut.length) {
    return <p className="kartu p-6 text-center text-teks-2">Tidak ada saham yang memenuhi semua syarat ini.</p>;
  }

  return (
    <div ref={wadah} className="kartu overflow-x-auto">
      <table className="tabel">
        <thead>
          <tr>
            <th scope="col" className="w-10"><span className="sr-only-x">Watchlist</span></th>
            {kepala("kode", "Kode", false)}
            <th scope="col" className="hidden sm:table-cell">Nama</th>
            {kepala("harga", "Harga")}
            {kepala("perubahanPersen", "Hari ini")}
            {tampilKolom.map((k) => {
              const f = FIELD_MAP.get(k.kunci)!;
              return kepala(k.kunci, f.istilah ? <Istilah k={f.istilah}>{f.label.split(" ")[0]}</Istilah> : f.label);
            })}
          </tr>
        </thead>
        <tbody>
          {terurut.map((s) => (
            <tr key={s.kode}>
              <td className="!py-1"><TombolWatchlist kode={s.kode} kecil /></td>
              <td className="angka font-semibold">
                <Link href={`/saham/${s.kode}`} className="gh-teks hover:underline">
                  {s.kode}
                </Link>
              </td>
              <td className="hidden max-w-[16rem] truncate text-teks-2 sm:table-cell">{s.nama}</td>
              <td className="angka kanan">{angka(s.harga)}</td>
              <td className="kanan"><Perubahan nilai={s.perubahanPersen} /></td>
              {tampilKolom.map((k) => (
                <td key={k.kunci} className="angka kanan">{k.tampil(s)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

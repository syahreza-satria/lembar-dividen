"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLive } from "@/lib/live";
import { HargaLive } from "./HargaLive";
import { JudulKartu } from "./JudulKartu";
import { Perubahan } from "./Perubahan";

export type BarisPasar = { kode: string; nama: string; sektor: string; harga: number; persen: number | null };

/** Menggabungkan data penutupan (server) dengan kuotasi live; peringkat dihitung ulang tiap pembaruan. */
function useGabungan(data: BarisPasar[]) {
  const { data: live } = useLive();
  return useMemo(
    () =>
      data.map((s) => {
        const q = live?.kuotasi[s.kode];
        return { ...s, persen: q?.p ?? s.persen, harga: q?.h ?? s.harga };
      }),
    [data, live],
  );
}

export function DaftarPerforma({
  judul,
  id,
  nomor,
  mode,
  data,
  className = "",
}: {
  judul: string;
  id: string;
  nomor: string;
  mode: "terbaik" | "terburuk";
  data: BarisPasar[];
  className?: string;
}) {
  const gabungan = useGabungan(data);
  const daftar = useMemo(() => {
    const urut = gabungan.filter((s) => s.persen !== null).sort((a, b) => (b.persen ?? 0) - (a.persen ?? 0));
    return mode === "terbaik" ? urut.slice(0, 5) : urut.slice(-5).reverse();
  }, [gabungan, mode]);

  return (
    <section aria-labelledby={id} className={`kartu overflow-hidden ${className}`}>
      <JudulKartu id={id} nomor={nomor}>
        {judul}
      </JudulKartu>
      <ol>
        {daftar.map((s) => (
          <li key={s.kode} className="border-b border-garis last:border-0">
            <Link href={`/saham/${s.kode}`} className="gh-bg flex min-h-14 items-center gap-3 px-5 py-2">
              <span className="angka w-12 font-semibold">{s.kode}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-teks-2">{s.nama}</span>
              <HargaLive kode={s.kode} fallback={s.harga} className="angka hidden text-sm sm:inline" />
              <Perubahan nilai={s.persen} className="w-24 justify-end text-sm" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SektorLive({ data, className = "" }: { data: BarisPasar[]; className?: string }) {
  const gabungan = useGabungan(data);
  const sektor = useMemo(() => {
    const per = new Map<string, number[]>();
    for (const s of gabungan) if (s.persen !== null) per.set(s.sektor, [...(per.get(s.sektor) ?? []), s.persen]);
    return [...per.entries()]
      .map(([nama, v]) => ({ nama, rata: v.reduce((a, b) => a + b, 0) / v.length }))
      .sort((a, b) => b.rata - a.rata);
  }, [gabungan]);
  const maks = Math.max(...sektor.map((s) => Math.abs(s.rata)), 0.01);

  return (
    <section aria-labelledby="sektor" className={`kartu overflow-hidden ${className}`}>
      <JudulKartu id="sektor" nomor="02-A">
        Sektor hari ini
      </JudulKartu>
      <ul className="space-y-3 p-5">
        {sektor.map((s) => (
          <li key={s.nama} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_auto]">
            <span className="truncate text-teks-2">{s.nama}</span>
            <span className="relative h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden>
              <span
                data-bar="kiri"
                className={`absolute inset-y-0 left-0 rounded-full ${s.rata >= 0 ? "bg-naik" : "bg-turun"}`}
                style={{ width: `${Math.max(4, (Math.abs(s.rata) / maks) * 100)}%` }}
              />
            </span>
            <Perubahan nilai={s.rata} className="w-24 justify-end" />
          </li>
        ))}
      </ul>
    </section>
  );
}

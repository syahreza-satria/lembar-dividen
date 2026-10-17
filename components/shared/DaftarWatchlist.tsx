"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import type { RingkasSaham } from "@/lib/data";
import { simpanWatchlist, useWatchlist } from "@/lib/watchlist";
import { TabelHasil } from "./TabelHasil";
import { Unduh } from "./ikon";

export function DaftarWatchlist({ data }: { data: RingkasSaham[] }) {
  const { daftar } = useWatchlist();
  const berkas = useRef<HTMLInputElement>(null);
  const id = useId();
  const [pesan, setPesan] = useState<string | null>(null);

  const terpilih = useMemo(() => data.filter((s) => daftar.includes(s.kode)), [data, daftar]);
  const tidakDikenal = daftar.filter((k) => !data.some((s) => s.kode === k));

  const ekspor = () => {
    const blob = new Blob([JSON.stringify({ aplikasi: "lembar-dividen", watchlist: daftar }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "watchlist-lembar-dividen.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const impor = async (f: File | undefined) => {
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      const arr: unknown = Array.isArray(j) ? j : j?.watchlist;
      if (!Array.isArray(arr)) throw new Error();
      const valid = arr.filter((k): k is string => typeof k === "string" && /^[A-Za-z]{4}$/.test(k)).map((k) => k.toUpperCase());
      simpanWatchlist([...daftar, ...valid]);
      setPesan(`${valid.length} kode diimpor dan digabung dengan watchlist yang ada.`);
    } catch {
      setPesan("Berkas tidak dikenali. Gunakan berkas JSON hasil ekspor Lembar Dividen.");
    }
    if (berkas.current) berkas.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="tombol tombol-sekunder tombol-sm" onClick={ekspor} disabled={daftar.length === 0}>
          <Unduh /> Ekspor JSON
        </button>
        <label htmlFor={`${id}-impor`} className="tombol tombol-sekunder tombol-sm cursor-pointer">
          Impor JSON
        </label>
        <input id={`${id}-impor`} ref={berkas} type="file" accept="application/json,.json" className="sr-only-x" onChange={(e) => impor(e.target.files?.[0])} />
        {pesan && <p role="status" className="text-sm text-teks-2">{pesan}</p>}
      </div>

      {terpilih.length === 0 ? (
        <div className="kartu p-8 text-center">
          <p className="font-judul text-lg font-semibold">Watchlist masih kosong</p>
          <p className="mx-auto mt-2 max-w-md text-teks-2">
            Tekan ikon bintang di daftar atau halaman saham untuk menyimpan.
          </p>
          <Link href="/saham" className="tombol tombol-utama mt-5">Lihat daftar saham</Link>
        </div>
      ) : (
        <>
          <TabelHasil data={terpilih} kolom={["per", "dy", "rsi14"]} urutAwal={{ kunci: "kode", arah: "naik" }} />
          <p className="text-sm text-teks-2">
            <Link href={`/bandingkan?k=${terpilih.slice(0, 3).map((s) => s.kode).join(",")}`} className="text-aksen underline underline-offset-4">
              Bandingkan {Math.min(3, terpilih.length)} saham pertama
            </Link>
          </p>
        </>
      )}
      {tidakDikenal.length > 0 && (
        <p className="text-sm text-teks-2">Kode tidak ada di data saat ini: {tidakDikenal.join(", ")}.</p>
      )}
    </div>
  );
}

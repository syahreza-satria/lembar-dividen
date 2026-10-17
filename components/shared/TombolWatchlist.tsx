"use client";

import { gsap, kurangiGerak } from "@/lib/animasi";
import { useWatchlist } from "@/lib/watchlist";
import { Bintang } from "./ikon";

export function TombolWatchlist({ kode, kecil = false }: { kode: string; kecil?: boolean }) {
  const { ada, toggle: ubah } = useWatchlist();
  const toggle = (k: string, e: React.MouseEvent<HTMLButtonElement>) => {
    ubah(k);
    const ikon = e.currentTarget.querySelector("svg");
    if (ikon && !kurangiGerak()) gsap.fromTo(ikon, { scale: 1.6, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(3)", overwrite: "auto" });
  };
  const dipilih = ada(kode);
  if (kecil) {
    return (
      <button
        type="button"
        onClick={(e) => toggle(kode, e)}
        aria-pressed={dipilih}
        aria-label={dipilih ? `Hapus ${kode} dari watchlist` : `Tambah ${kode} ke watchlist`}
        className={`rounded-[8px] p-1.5 gh-bg ${dipilih ? "text-peringatan" : "text-teks-2"}`}
      >
        <Bintang isi={dipilih} width={18} height={18} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => toggle(kode, e)}
      aria-pressed={dipilih}
      className={`tombol tombol-sekunder tombol-sm ${dipilih ? "!border-peringatan !text-peringatan" : ""}`}
    >
      <Bintang isi={dipilih} />
      {dipilih ? "Di watchlist" : "Tambah ke watchlist"}
    </button>
  );
}

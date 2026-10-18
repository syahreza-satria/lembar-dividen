"use client";

import { useEffect, useRef } from "react";
import { gsap, kurangiGerak } from "@/lib/animasi";
import { angka } from "@/lib/format";
import { useKuotasi } from "@/lib/live";
import { Perubahan } from "./Perubahan";

/** Harga terakhir; memakai kuotasi live bila ada, selain itu harga penutupan dari server. Berkedip hijau/merah saat berubah. */
export function HargaLive({
  kode,
  fallback,
  desimal = 0,
  awalan = "",
  className = "",
}: {
  kode: string;
  fallback: number;
  desimal?: number;
  awalan?: string;
  className?: string;
}) {
  const q = useKuotasi(kode);
  const nilai = q?.h ?? fallback;
  const sebelumnya = useRef(nilai);
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const lama = sebelumnya.current;
    sebelumnya.current = nilai;
    if (lama === nilai || !el.current || kurangiGerak()) return;
    const asal = getComputedStyle(el.current).color;
    gsap.fromTo(
      el.current,
      { color: nilai > lama ? "#4ade80" : "#f87171" },
      { color: asal, duration: 1.4, ease: "power2.out", clearProps: "color", overwrite: "auto" },
    );
  }, [nilai]);

  return (
    <span ref={el} className={className}>
      {awalan}
      {angka(nilai, desimal)}
    </span>
  );
}

/** Persen perubahan harian dengan tanda dan ikon; live bila tersedia. */
export function PerubahanLive({ kode, fallback, desimal = 2, className = "" }: { kode: string; fallback: number | null; desimal?: number; className?: string }) {
  const q = useKuotasi(kode);
  return <Perubahan nilai={q?.p ?? fallback} desimal={desimal} className={className} />;
}

/** Selisih absolut harian, mis. "(−900)". */
export function SelisihLive({ kode, fallback, className = "" }: { kode: string; fallback: number | null; className?: string }) {
  const q = useKuotasi(kode);
  const u = q ? q.u : fallback;
  if (u === null || u === undefined) return null;
  return (
    <span className={className}>
      ({u > 0 ? "+" : u < 0 ? "−" : ""}
      {angka(Math.abs(u), Math.abs(u) < 100 && u % 1 ? 2 : 0)})
    </span>
  );
}

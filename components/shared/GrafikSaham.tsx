"use client";

import dynamic from "next/dynamic";
import { useMode } from "@/lib/mode";
import { Masuk } from "./Masuk";
import type { Candle } from "@/lib/types";

const Muat = ({ tinggi }: { tinggi: number }) => (
  <div style={{ height: tinggi }} className="flex w-full items-center justify-center text-sm text-teks-2">
    Memuat grafik…
  </div>
);

// Lightweight Charts hanya berjalan di browser, jadi tidak dirender di server.
const GrafikGaris = dynamic(() => import("@/components/pemula/GrafikGaris"), { ssr: false, loading: () => <Muat tinggi={340} /> });
const GrafikCandle = dynamic(() => import("@/components/pro/GrafikCandle"), { ssr: false, loading: () => <Muat tinggi={420} /> });

export function GrafikSaham({ kode, harga }: { kode: string; harga: Candle[] }) {
  const mode = useMode();
  return (
    <Masuk key={mode} y={8}>
      {mode === "pro" ? <GrafikCandle kode={kode} harga={harga} /> : <GrafikGaris kode={kode} harga={harga} />}
    </Masuk>
  );
}

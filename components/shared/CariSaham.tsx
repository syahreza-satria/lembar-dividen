"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { animasiMasuk } from "@/lib/animasi";
import { Cari } from "./ikon";

export type ItemCari = { kode: string; nama: string; sektor: string };

export function CariSaham({ daftar }: { daftar: ItemCari[] }) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const [buka, setBuka] = useState(false);
  const [aktif, setAktif] = useState(0);
  const kotak = useRef<HTMLDivElement>(null);

  const hasil = useMemo(() => {
    const kata = q.trim().toLowerCase();
    if (!kata) return [];
    const skor = (s: ItemCari) => {
      const k = s.kode.toLowerCase();
      if (k === kata) return 0;
      if (k.startsWith(kata)) return 1;
      if (s.nama.toLowerCase().startsWith(kata)) return 2;
      if (k.includes(kata) || s.nama.toLowerCase().includes(kata)) return 3;
      return -1;
    };
    return daftar
      .map((s) => ({ s, p: skor(s) }))
      .filter((x) => x.p >= 0)
      .sort((a, b) => a.p - b.p || a.s.kode.localeCompare(b.s.kode))
      .slice(0, 8)
      .map((x) => x.s);
  }, [q, daftar]);

  const pilih = (kode: string) => {
    setBuka(false);
    setQ("");
    router.push(`/saham/${kode}`);
  };

  return (
    <div
      ref={kotak}
      className="relative w-full"
      onBlur={(e) => {
        if (!kotak.current?.contains(e.relatedTarget as Node)) setBuka(false);
      }}
    >
      <label htmlFor={`${id}-in`} className="sr-only-x">
        Cari saham berdasarkan kode atau nama
      </label>
      <Cari className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-teks-2" />
      <input
        id={`${id}-in`}
        type="search"
        role="combobox"
        aria-expanded={buka && hasil.length > 0}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={buka && hasil[aktif] ? `${id}-${hasil[aktif].kode}` : undefined}
        autoComplete="off"
        placeholder="Cari saham"
        className="input pl-9"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setBuka(true);
          setAktif(0);
        }}
        onFocus={() => setBuka(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAktif((a) => Math.min(a + 1, hasil.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setAktif((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && hasil[aktif]) {
            e.preventDefault();
            pilih(hasil[aktif].kode);
          } else if (e.key === "Escape") {
            setBuka(false);
          }
        }}
      />
      {buka && q.trim() && (
        <ul
          id={`${id}-list`}
          ref={(el) => {
            if (el) animasiMasuk(el, { y: -6, duration: 0.18 });
          }}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-[12px] border border-garis-kuat bg-surface p-1 shadow-lg"
        >
          {hasil.length === 0 && <li className="px-3 py-2 text-sm text-teks-2">Saham tidak ditemukan.</li>}
          {hasil.map((s, i) => (
            <li
              key={s.kode}
              id={`${id}-${s.kode}`}
              role="option"
              aria-selected={i === aktif}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pilih(s.kode)}
              onMouseEnter={() => setAktif(i)}
              className={`flex cursor-pointer items-baseline gap-3 rounded-[8px] px-3 py-2 ${i === aktif ? "bg-surface-2" : ""}`}
            >
              <span className="angka w-12 shrink-0 font-semibold">{s.kode}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-teks-2">{s.nama}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const KUNCI = "ld-watchlist";
const PERISTIWA = "ld-watchlist-berubah";

function langganan(cb: () => void) {
  window.addEventListener(PERISTIWA, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(PERISTIWA, cb);
    window.removeEventListener("storage", cb);
  };
}

function bacaMentah(): string {
  try {
    return localStorage.getItem(KUNCI) ?? "[]";
  } catch {
    return "[]";
  }
}

function urai(mentah: string): string[] {
  try {
    const v = JSON.parse(mentah);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function simpanWatchlist(daftar: string[]) {
  const unik = [...new Set(daftar.map((k) => k.toUpperCase()))];
  try {
    localStorage.setItem(KUNCI, JSON.stringify(unik));
  } catch {
    /* diblokir */
  }
  window.dispatchEvent(new Event(PERISTIWA));
}

export function useWatchlist() {
  // Snapshot berupa string agar identitasnya stabil antar render.
  const mentah = useSyncExternalStore(langganan, bacaMentah, () => "[]");
  const daftar = useMemo(() => urai(mentah), [mentah]);

  const ada = useCallback((kode: string) => daftar.includes(kode), [daftar]);
  const toggle = useCallback(
    (kode: string) => {
      const sekarang = urai(bacaMentah());
      simpanWatchlist(sekarang.includes(kode) ? sekarang.filter((k) => k !== kode) : [...sekarang, kode]);
    },
    [],
  );
  return { daftar, ada, toggle };
}

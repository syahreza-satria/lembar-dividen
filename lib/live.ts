"use client";

import { useSyncExternalStore } from "react";
import type { Kuotasi, RespLive } from "./live-tipe";

/**
 * Store kuotasi bersama: satu polling untuk seluruh halaman, berjalan hanya selama ada komponen
 * yang berlangganan dan tab terlihat. Jeda: 20 dtk saat pasar buka, 5 menit saat tutup, 60 dtk bila gagal.
 * Bila gagal, komponen kembali memakai data penutupan dari server.
 */
type Keadaan = { data: RespLive | null; galat: boolean };

const AWAL: Keadaan = { data: null, galat: false };
let keadaan: Keadaan = AWAL;
const pelanggan = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let aktif = false;
let sedangTarik = false;

const siarkan = () => pelanggan.forEach((f) => f());

function jeda() {
  if (!keadaan.data) return 60_000;
  return keadaan.data.status === "REGULAR" ? 20_000 : 300_000;
}

function jadwal() {
  if (!aktif) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    if (document.visibilityState === "visible") void tarik();
    else jadwal();
  }, jeda());
}

async function tarik() {
  if (sedangTarik) return;
  sedangTarik = true;
  try {
    const res = await fetch("/api/kuotasi", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    keadaan = { data: (await res.json()) as RespLive, galat: false };
  } catch {
    keadaan = { data: keadaan.data, galat: true };
  } finally {
    sedangTarik = false;
  }
  siarkan();
  jadwal();
}

function saatTampak() {
  if (document.visibilityState === "visible" && aktif) void tarik();
}

function langganan(cb: () => void) {
  pelanggan.add(cb);
  if (pelanggan.size === 1) {
    aktif = true;
    document.addEventListener("visibilitychange", saatTampak);
    void tarik();
  }
  return () => {
    pelanggan.delete(cb);
    if (pelanggan.size === 0) {
      aktif = false;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", saatTampak);
    }
  };
}

export function useLive(): Keadaan {
  return useSyncExternalStore(langganan, () => keadaan, () => AWAL);
}

export function useKuotasi(kode: string): Kuotasi | undefined {
  return useSyncExternalStore(
    langganan,
    () => keadaan.data?.kuotasi[kode],
    () => undefined,
  );
}

const jamWib = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" });
export const formatJamWib = (epochDetik: number) => `${jamWib.format(new Date(epochDetik * 1000)).replace(":", ".")} WIB`;

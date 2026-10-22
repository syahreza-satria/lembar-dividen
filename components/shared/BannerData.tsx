"use client";

import { useSyncExternalStore } from "react";
import { tanggal } from "@/lib/format";
import { formatJamWib, tanggalWib, useLive } from "@/lib/live";
import { KUNCI_IHSG } from "@/lib/live-tipe";
import { Info } from "./ikon";

const kosong = () => () => {};

/** Muncul hanya bila data terakhir sudah lebih dari 4 hari kalender (mis. pipeline gagal beberapa hari). */
export function BannerData({ tanggalData }: { tanggalData: string }) {
  const waktuLive = useLive().data?.kuotasi[KUNCI_IHSG]?.t;
  const basi = useSyncExternalStore(
    kosong,
    () => Date.now() - new Date(`${tanggalData}T00:00:00Z`).getTime() > 4 * 86400_000,
    () => false,
  );
  if (!basi) return null;
  return (
    <div role="status" className="border-b border-garis bg-[rgba(250,204,21,0.08)]">
      <p className="mx-auto flex items-start gap-2 px-4 py-2 text-sm text-peringatan">
        <Info className="mt-0.5 shrink-0" />
        <span>
          Data penutupan terakhir {tanggal(tanggalData)}. Angka bisa sudah tertinggal.
          {waktuLive ? ` Kuotasi live: ${tanggal(tanggalWib(waktuLive))}, ${formatJamWib(waktuLive)}.` : ""}
        </span>
      </p>
    </div>
  );
}

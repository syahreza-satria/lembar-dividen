"use client";

import { formatJamWib, useLive } from "@/lib/live";
import { KUNCI_IHSG } from "@/lib/live-tipe";

/** Penanda keadaan data: live (tertunda), pasar tutup, atau hanya data penutupan bila kuotasi gagal. */
export function StatusPasar({ className = "" }: { className?: string }) {
  const { data, galat } = useLive();
  let teks: string;
  let kelas = "";
  let titik = "bg-teks-2";
  let denyut = false;

  if (!data) {
    teks = galat ? "Data penutupan" : "Menyambung…";
  } else {
    const waktu = data.kuotasi[KUNCI_IHSG]?.t;
    if (data.status === "REGULAR") {
      teks = `Live · tertunda ${data.tundaMenit ?? 10} mnt${waktu ? ` · ${formatJamWib(waktu)}` : ""}`;
      kelas = "chip-sukses";
      titik = "bg-naik";
      denyut = !galat;
    } else {
      teks = `Pasar tutup${waktu ? ` · ${formatJamWib(waktu)}` : ""}`;
    }
    if (galat) {
      teks += " · koneksi terputus";
      kelas = "chip-peringatan";
    }
  }

  return (
    <span role="status" className={`chip ${kelas} ${className}`}>
      <span aria-hidden className={`size-1.5 rounded-full ${titik} ${denyut ? "animate-pulse" : ""}`} />
      {teks}
    </span>
  );
}

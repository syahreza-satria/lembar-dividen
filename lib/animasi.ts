"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Didaftarkan sekali di sini; semua komponen mengimpor gsap/useGSAP dari modul ini.
gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, ScrollTrigger, useGSAP };

/** Pengguna meminta gerak dikurangi: lewati animasi gerak, ubah kondisi (warna dsb) secara instan. */
export function kurangiGerak(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Properti yang dibersihkan setelah animasi masuk agar CSS kembali berlaku. */
export const BERSIH_MASUK = "opacity,visibility,transform";

/** Animasi masuk standar untuk satu atau beberapa elemen (kartu, panel, baris). */
export function animasiMasuk(target: gsap.TweenTarget, opsi: gsap.TweenVars = {}) {
  if (kurangiGerak()) return null;
  return gsap.fromTo(
    target,
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", clearProps: BERSIH_MASUK, overwrite: "auto", ...opsi },
  );
}

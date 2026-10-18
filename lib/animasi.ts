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

/**
 * Selama jendela ini (ms, dihitung dari performance.now) komponen anak tidak menganimasikan dirinya sendiri,
 * karena halaman sedang masuk. Mencegah animasi bersarang (fade ganda) yang terlihat patah.
 */
// Nilai awal menutup muatan pertama (hydration terjadi sebelum EfekGlobal sempat memasang jendela).
export const jendelaMasuk = { sampai: typeof performance !== "undefined" ? performance.now() + 2500 : 0 };
export const dalamJendelaMasuk = () => typeof performance !== "undefined" && performance.now() < jendelaMasuk.sampai;

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

/**
 * Animasi masuk untuk komponen anak: disembunyikan sinkron sebelum paint, lalu satu frame kemudian
 * diputuskan: bila halaman sedang masuk (induk yang menganimasikan) cukup ditampilkan, selain itu dianimasikan.
 * Mengembalikan fungsi pembatal untuk dipakai sebagai cleanup efek.
 */
export function masukBerjendela(target: gsap.TweenTarget, opsi: gsap.TweenVars = {}) {
  if (kurangiGerak()) return () => {};
  const { y: yAwal, ...sisa } = opsi;
  const y = typeof yAwal === "number" ? yAwal : 12;
  gsap.set(target, { autoAlpha: 0, y });
  const id = requestAnimationFrame(() => {
    if (dalamJendelaMasuk()) {
      gsap.set(target, { clearProps: BERSIH_MASUK });
      return;
    }
    gsap.to(target, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", clearProps: BERSIH_MASUK, overwrite: "auto", ...sisa });
  });
  return () => cancelAnimationFrame(id);
}

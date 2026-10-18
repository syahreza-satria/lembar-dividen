"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { animasiMasuk, gsap, jendelaMasuk, ScrollTrigger, useGSAP } from "@/lib/animasi";
import { PERISTIWA_MODE } from "@/lib/mode";

/**
 * Semua gerak situs ada di sini (GSAP):
 * - hover, tekan, fokus, dan tooltip lewat event delegation (kelas penanda: tombol, chip, kartu, gh-*),
 * - masuk halaman: label, judul bertopeng (masked reveal), blok dengan stagger dan scroll-trigger,
 * - cahaya latar dibiarkan statis (animasi layer besar terbukti memberatkan).
 * CSS tidak punya transisi; status akhir hover didefinisikan di tabel ATURAN.
 */

type Aturan = { sel: string; ke: Record<string, string>; angkat?: number };

const PUTIH = "rgba(255,255,255,";
const ATURAN: Aturan[] = [
  { sel: ".tombol-utama", ke: { backgroundColor: "rgba(228,228,231,1)" }, angkat: -1 },
  { sel: ".tombol-sekunder", ke: { backgroundColor: `${PUTIH}0.08)`, borderColor: `${PUTIH}0.7)` }, angkat: -1 },
  { sel: ".tombol-ghost", ke: { backgroundColor: `${PUTIH}0.08)`, color: "rgb(255,255,255)" }, angkat: -1 },
  { sel: ".tombol-aktif", ke: { backgroundColor: "rgba(228,228,231,1)" }, angkat: -1 },
  { sel: "a.chip, button.chip:not(.chip-aktif)", ke: { backgroundColor: `${PUTIH}0.08)`, borderColor: `${PUTIH}0.5)` }, angkat: -1 },
  { sel: "button.chip.chip-aktif", ke: {}, angkat: -1 },
  { sel: ".gh-bg", ke: { backgroundColor: `${PUTIH}0.05)` } },
  { sel: ".gh-teks", ke: { color: "rgb(255,255,255)" } },
  { sel: ".gh-nav", ke: { backgroundColor: `${PUTIH}0.08)`, color: "rgb(255,255,255)" } },
  { sel: ".gh-kartu", ke: { borderColor: "rgba(82,82,91,1)" }, angkat: -2 },
  { sel: ".tabel tbody tr", ke: { backgroundColor: `${PUTIH}0.03)` } },
  { sel: ".input:not(:disabled):not(:focus)", ke: { borderColor: "rgba(82,82,91,1)" } },
];

// Elemen yang memberi umpan balik saat ditekan.
const SEL_TEKAN = ".tombol:not(:disabled), button.chip, button.kartu, .gh-kartu, [role='radio'], [role='tab'], .gh-nav";

const SEMUA_SEL = ATURAN.map((a) => a.sel).join(",");
const KEBAB: Record<string, string> = {
  backgroundColor: "background-color",
  borderColor: "border-top-color",
  color: "color",
  boxShadow: "box-shadow",
};

type Keadaan = { hover: boolean; tekan: boolean; istirahat: Record<string, string>; kunci: string[] };
const keadaan = new WeakMap<Element, Keadaan>();
const aktifSet = new Set<HTMLElement>();

/** Mengembalikan semua elemen ke keadaan istirahat seketika (tanpa menunggu tween keluar-hover selesai). */
function resetSemua() {
  aktifSet.forEach((el) => {
    const s = keadaan.get(el);
    gsap.killTweensOf(el);
    gsap.set(el, { clearProps: [...(s?.kunci ?? []), "transform"].join(",") });
    keadaan.delete(el);
  });
  aktifSet.clear();
}

const alfaNol = (c: string) => c.replace(/rgba?\(([^)]*)\)/, (_, i: string) => `rgba(${i.split(",").slice(0, 3).join(",")},0)`);

function gabung(el: Element): { ke: Record<string, string>; angkat: number } {
  const ke: Record<string, string> = {};
  let angkat = 0;
  for (const a of ATURAN) {
    if (!el.matches(a.sel)) continue;
    Object.assign(ke, a.ke);
    angkat = Math.min(angkat, a.angkat ?? 0);
  }
  return { ke, angkat };
}

function terapkan(el: HTMLElement, kurangi: boolean) {
  const s = keadaan.get(el);
  if (!s) return;
  const { ke, angkat } = gabung(el);
  const vars: gsap.TweenVars = { duration: kurangi ? 0 : s.hover || s.tekan ? 0.22 : 0.32, ease: "power3.out", overwrite: "auto" };
  for (const k of s.kunci) vars[k] = s.hover ? ke[k] : s.istirahat[k];
  if (!kurangi) {
    vars.y = s.hover ? angkat : 0;
    vars.scale = s.tekan ? 0.98 : 1;
  }
  vars.onComplete = () => {
    if (!s.hover && !s.tekan) {
      gsap.set(el, { clearProps: [...s.kunci, "transform"].join(",") });
      keadaan.delete(el);
      aktifSet.delete(el);
    }
  };
  gsap.to(el, vars);
}

function mulai(el: HTMLElement) {
  let s = keadaan.get(el);
  if (!s) {
    const { ke } = gabung(el);
    const cs = getComputedStyle(el);
    const istirahat: Record<string, string> = {};
    const kunci = Object.keys(ke);
    for (const k of kunci) {
      let v = cs.getPropertyValue(KEBAB[k]);
      if (k === "boxShadow" && (v === "none" || !v)) v = "0 0 0 0 rgba(0,0,0,0)";
      if ((k === "backgroundColor" || k === "borderColor") && (v === "rgba(0, 0, 0, 0)" || v === "transparent")) v = alfaNol(ke[k]);
      istirahat[k] = v;
    }
    s = { hover: false, tekan: false, istirahat, kunci };
    keadaan.set(el, s);
    aktifSet.add(el);
  }
  return s;
}

const tooltipDari = (el: Element) => el.querySelector<HTMLElement>(":scope > .istilah-tip");

function tampilTip(ist: HTMLElement, kurangi: boolean) {
  const tip = tooltipDari(ist);
  if (!tip) return;
  gsap.fromTo(
    tip,
    { autoAlpha: 0, y: kurangi ? 0 : 6, xPercent: -50 },
    { autoAlpha: 1, y: 0, xPercent: -50, duration: kurangi ? 0 : 0.3, delay: kurangi ? 0 : 0.12, ease: "power3.out", overwrite: true },
  );
}

function sembunyiTip(ist: HTMLElement, kurangi: boolean) {
  const tip = tooltipDari(ist);
  if (!tip) return;
  gsap.to(tip, { autoAlpha: 0, y: kurangi ? 0 : 6, duration: kurangi ? 0 : 0.15, overwrite: true });
}

const tampak = (e: Element) => (e as HTMLElement).offsetParent !== null;

/** Animasi masuk satu halaman: label → judul bertopeng → blok (stagger + scroll-trigger). */
function masukHalaman(awal: boolean) {
  const root = document.getElementById("isi");
  if (!root) return;
  const html = document.documentElement;
  const label = Array.from(root.querySelectorAll<HTMLElement>("[data-label]")).filter(tampak);
  const reveal = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")).filter(tampak);
  const masuk = Array.from(root.querySelectorAll<HTMLElement>("[data-masuk]")).filter(tampak);
  const blok = Array.from(root.querySelectorAll<HTMLElement>(":scope > * > *:not([data-kepala])")).filter(tampak);
  const header = awal ? Array.from(document.querySelectorAll<HTMLElement>("header.situs [data-masuk]")) : [];

  jendelaMasuk.sampai = performance.now() + 1700;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  if (header.length) {
    tl.fromTo(header, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05, clearProps: "opacity,visibility,transform" }, 0);
  }
  if (label.length) {
    tl.fromTo(label, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04, clearProps: "opacity,visibility,transform" }, 0.05);
  }
  if (reveal.length) {
    tl.fromTo(reveal, { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.1, clearProps: "transform" }, 0.1);
  }
  if (masuk.length) {
    tl.fromTo(masuk, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, clearProps: "opacity,visibility,transform" }, 0.35);
  }

  // Blok: yang sudah terlihat masuk berurutan (maks. 6 agar tidak banyak layer serentak); sisanya muncul saat discroll.
  let urutan = 0;
  // Semua pembacaan layout dikumpulkan dulu; menulis style di antara pembacaan memaksa layout berulang.
  const batas = window.innerHeight * 0.9;
  const posisi = blok.slice(0, 12).map((el) => ({ el, terlihat: el.getBoundingClientRect().top < batas }));
  posisi.forEach(({ el, terlihat }) => {
    const bisaAnimasi = !terlihat || urutan < 6;
    if (!bisaAnimasi) {
      gsap.set(el, { clearProps: "opacity,visibility,transform" });
      return;
    }
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: terlihat ? 0.25 + urutan++ * 0.07 : 0,
        clearProps: "opacity,visibility,transform",
        scrollTrigger: terlihat ? undefined : { trigger: el, start: "top 92%", once: true },
      },
    );
  });

  if (awal) html.classList.remove("anim");
}

export function EfekGlobal() {
  const path = usePathname();
  const pertama = useRef(true);

  // Hover, tekan, fokus, tooltip.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add({ normal: "(prefers-reduced-motion: no-preference)", kurangi: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const kurangi = !!ctx.conditions?.kurangi;
      const mouse = (e: PointerEvent) => e.pointerType !== "touch";

      const masuk = (e: PointerEvent) => {
        if (!mouse(e)) return;
        const t = e.target as Element;
        const el = t.closest<HTMLElement>(SEMUA_SEL);
        if (el && !el.contains(e.relatedTarget as Node | null)) {
          mulai(el).hover = true;
          terapkan(el, kurangi);
        }
        const ist = t.closest<HTMLElement>(".istilah");
        if (ist && !ist.contains(e.relatedTarget as Node | null)) tampilTip(ist, kurangi);
      };
      const keluar = (e: PointerEvent) => {
        if (!mouse(e)) return;
        const t = e.target as Element;
        const el = t.closest<HTMLElement>(SEMUA_SEL);
        if (el && !el.contains(e.relatedTarget as Node | null)) {
          const s = keadaan.get(el);
          if (s) {
            s.hover = false;
            s.tekan = false;
            terapkan(el, kurangi);
          }
        }
        const ist = t.closest<HTMLElement>(".istilah");
        if (ist && !ist.contains(e.relatedTarget as Node | null)) sembunyiTip(ist, kurangi);
      };
      const tekan = (e: PointerEvent) => {
        const el = (e.target as Element).closest<HTMLElement>(SEL_TEKAN);
        if (!el) return;
        mulai(el).tekan = true;
        terapkan(el, kurangi);
      };
      const lepas = () => {
        document.querySelectorAll<HTMLElement>(SEL_TEKAN).forEach((el) => {
          const s = keadaan.get(el);
          if (s?.tekan) {
            s.tekan = false;
            terapkan(el, kurangi);
          }
        });
      };

      const fokusMasuk = (e: FocusEvent) => {
        const t = e.target as Element;
        const ist = t.closest<HTMLElement>(".istilah");
        if (ist) tampilTip(ist, kurangi);
        if (t.matches(".input")) {
          gsap.fromTo(
            t,
            { borderColor: "rgba(39,39,42,1)", boxShadow: "0 0 0 0px rgba(255,255,255,0)" },
            { borderColor: "rgba(255,255,255,1)", boxShadow: "0 0 0 3px rgba(255,255,255,0.12)", duration: kurangi ? 0 : 0.3, ease: "power3.out", overwrite: "auto" },
          );
        }
      };
      const fokusKeluar = (e: FocusEvent) => {
        const t = e.target as Element;
        const ist = t.closest<HTMLElement>(".istilah");
        if (ist) sembunyiTip(ist, kurangi);
        if (t.matches(".input")) {
          gsap.to(t, {
            borderColor: "rgba(39,39,42,1)",
            boxShadow: "0 0 0 0px rgba(255,255,255,0)",
            duration: kurangi ? 0 : 0.3,
            overwrite: "auto",
            onComplete: () => gsap.set(t, { clearProps: "borderColor,boxShadow" }),
          });
        }
      };

      const sembunyi = () => document.visibilityState === "hidden" && resetSemua();
      document.documentElement.addEventListener("pointerleave", resetSemua);
      window.addEventListener("blur", resetSemua);
      document.addEventListener("visibilitychange", sembunyi);
      document.addEventListener("pointerover", masuk);
      document.addEventListener("pointerout", keluar);
      document.addEventListener("pointerdown", tekan);
      document.addEventListener("pointerup", lepas);
      document.addEventListener("pointercancel", lepas);
      document.addEventListener("focusin", fokusMasuk);
      document.addEventListener("focusout", fokusKeluar);

      return () => {
        document.documentElement.removeEventListener("pointerleave", resetSemua);
        window.removeEventListener("blur", resetSemua);
        document.removeEventListener("visibilitychange", sembunyi);
        resetSemua();
        document.removeEventListener("pointerover", masuk);
        document.removeEventListener("pointerout", keluar);
        document.removeEventListener("pointerdown", tekan);
        document.removeEventListener("pointerup", lepas);
        document.removeEventListener("pointercancel", lepas);
        document.removeEventListener("focusin", fokusMasuk);
        document.removeEventListener("focusout", fokusKeluar);
      };
    });
    return () => mm.revert();
  }, []);

  // Masuk halaman setiap pindah rute (ScrollTrigger yang dibuat di sini ikut dibersihkan).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      resetSemua();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        masukHalaman(pertama.current);
        pertama.current = false;
        animasiBar();
        const segarkan = () => ScrollTrigger.refresh();
        window.addEventListener("load", segarkan);
        return () => window.removeEventListener("load", segarkan);
      });
      return () => mm.revert();
    },
    { dependencies: [path] },
  );

  // Pergantian Mode Pemula/Pro: konten yang tampil masuk kembali.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const saat = () => {
      clearTimeout(t);
      // Tunggu render konten baru selesai supaya animasi tidak berebut frame dengan React.
      t = setTimeout(() => {
        const root = document.getElementById("isi");
        if (!root) return;
        const reveal = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")).filter(tampak);
        const blok = Array.from(root.querySelectorAll<HTMLElement>(":scope > * > *:not([data-kepala])")).filter(tampak).slice(0, 6);
        jendelaMasuk.sampai = performance.now() + 900;
        if (reveal.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.fromTo(reveal, { yPercent: 105 }, { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.08, clearProps: "transform" });
        }
        animasiMasuk(blok, { y: 10, duration: 0.45, stagger: 0.04 });
        animasiBar();
      }, 90);
    };
    window.addEventListener(PERISTIWA_MODE, saat);
    return () => {
      clearTimeout(t);
      window.removeEventListener(PERISTIWA_MODE, saat);
    };
  }, []);

  return null;
}

/** Batang sektor tumbuh dari garis tengah. */
function animasiBar() {
  const bar = document.querySelectorAll<HTMLElement>("[data-bar]");
  if (!bar.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  bar.forEach((b, i) => {
    gsap.fromTo(
      b,
      { scaleX: 0, transformOrigin: b.dataset.bar === "kiri" ? "left center" : "right center" },
      { scaleX: 1, duration: 0.9, delay: 0.55 + i * 0.04, ease: "expo.out", clearProps: "transform", overwrite: "auto" },
    );
  });
}

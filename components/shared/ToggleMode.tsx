"use client";

import { useRef } from "react";
import { gsap, kurangiGerak, useGSAP } from "@/lib/animasi";
import { setMode, useMode, type Mode } from "@/lib/mode";

const PILIHAN: { nilai: Mode; label: string }[] = [
  { nilai: "pemula", label: "Pemula" },
  { nilai: "pro", label: "Pro" },
];

export function ToggleMode() {
  const mode = useMode();
  const wadah = useRef<HTMLDivElement>(null);
  const penanda = useRef<HTMLSpanElement>(null);
  const awal = useRef(true);

  // Penanda putih menggeser ke tombol aktif; warna teks tombol berganti bersamaan.
  useGSAP(
    () => {
      const tombol = wadah.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!tombol || !penanda.current) return;
      const dur = awal.current || kurangiGerak() ? 0 : 0.45;
      tombol.forEach((b) => {
        const aktif = b.dataset.nilai === mode;
        gsap.to(b, { color: aktif ? "#050505" : "#a1a1aa", duration: dur, ease: "power3.out", overwrite: "auto" });
        if (aktif) {
          gsap.to(penanda.current, { x: b.offsetLeft, width: b.offsetWidth, autoAlpha: 1, duration: dur, ease: "expo.out", overwrite: "auto" });
        }
      });
      awal.current = false;
    },
    { dependencies: [mode], scope: wadah },
  );

  return (
    <div
      ref={wadah}
      role="radiogroup"
      aria-label="Mode tampilan"
      className="relative inline-flex shrink-0 rounded-full border border-garis-kuat/60 bg-surface p-1"
    >
      <span ref={penanda} aria-hidden className="invisible absolute bottom-1 left-0 top-1 rounded-full bg-white" />
      {PILIHAN.map((p) => (
        <button
          key={p.nilai}
          type="button"
          role="radio"
          data-nilai={p.nilai}
          aria-checked={mode === p.nilai}
          onClick={() => setMode(p.nilai)}
          className="label-mono relative min-h-[32px] rounded-full px-4 text-teks-2"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

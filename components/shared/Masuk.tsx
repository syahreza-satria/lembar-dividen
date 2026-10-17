"use client";

import { useRef, type ReactNode } from "react";
import { animasiMasuk, useGSAP } from "@/lib/animasi";

/** Pembungkus: isinya masuk dengan fade + naik tiap kali komponen ini di-mount (pakai `key` untuk memicu ulang). */
export function Masuk({ children, className, y = 12 }: { children: ReactNode; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    animasiMasuk(ref.current, { y, duration: 0.35 });
  }, { scope: ref });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cariIstilah } from "@/lib/glosarium";
import { useMode } from "@/lib/mode";

/**
 * Mode Pemula: istilah selalu bisa diklik menuju halaman glosarium.
 * Mode Pro: penjelasan hanya muncul saat hover/fokus.
 */
export function Istilah({ k, children, className = "" }: { k: string; children: ReactNode; className?: string }) {
  const mode = useMode();
  const g = cariIstilah(k);
  if (!g) return <>{children}</>;
  const tip = (
    <span role="tooltip" className="istilah-tip">
      {g.ringkas}
    </span>
  );
  if (mode === "pemula") {
    return (
      <Link href={`/belajar/${g.slug}`} className={`istilah ${className}`}>
        {children}
        {tip}
      </Link>
    );
  }
  return (
    <span tabIndex={0} className={`istilah ${className}`}>
      {children}
      {tip}
    </span>
  );
}

"use client";

import { Fragment, useMemo } from "react";
import { GLOSARIUM } from "@/lib/glosarium";
import { Istilah } from "./Istilah";

const ALIAS = GLOSARIUM.flatMap((g) => g.alias.map((a) => ({ a, slug: g.slug }))).sort((x, y) => y.a.length - x.a.length);
const POLA = new RegExp(
  `(?<![\\p{L}\\d])(${ALIAS.map((x) => x.a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}\\d])`,
  "gu",
);
const PETA = new Map(ALIAS.map((x) => [x.a, x.slug]));

/** Menautkan kemunculan pertama tiap istilah glosarium di dalam teks (peka huruf besar-kecil). */
export function TeksIstilah({ teks }: { teks: string }) {
  const bagian = useMemo(() => {
    const hasil: { teks: string; slug?: string }[] = [];
    const sudah = new Set<string>();
    let akhir = 0;
    for (const m of teks.matchAll(POLA)) {
      const slug = PETA.get(m[1])!;
      if (sudah.has(slug)) continue;
      sudah.add(slug);
      if (m.index > akhir) hasil.push({ teks: teks.slice(akhir, m.index) });
      hasil.push({ teks: m[1], slug });
      akhir = m.index + m[1].length;
    }
    if (akhir < teks.length) hasil.push({ teks: teks.slice(akhir) });
    return hasil;
  }, [teks]);

  return (
    <>
      {bagian.map((b, i) => (
        <Fragment key={i}>{b.slug ? <Istilah k={b.slug}>{b.teks}</Istilah> : b.teks}</Fragment>
      ))}
    </>
  );
}

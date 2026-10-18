import type { ReactNode } from "react";

/** Kepala kartu bento: judul di kiri, nomor mono di kanan. */
export function JudulKartu({ nomor, children, id }: { nomor: string; children: ReactNode; id: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-garis px-5 py-4">
      <h2 id={id} className="text-lg font-medium">
        {children}
      </h2>
      <span className="label-mono !text-[10px]">{nomor}</span>
    </div>
  );
}

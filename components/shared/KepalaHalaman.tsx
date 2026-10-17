import type { ReactNode } from "react";

/**
 * Kepala halaman gaya Aether: label mono bernomor, judul besar dengan masked reveal
 * (isi `.topeng-isi` naik dari balik topeng lewat GSAP), lalu pengantar.
 */
export function KepalaHalaman({ nomor, label, judul, children }: { nomor: string; label: string; judul: ReactNode; children?: ReactNode }) {
  return (
    <header data-kepala className="space-y-5 border-b border-garis pb-10">
      <p className="label-mono" data-label>
        {nomor} {"//"} {label}
      </p>
      <h1 className="judul-halaman">
        <span className="topeng">
          <span className="topeng-isi" data-reveal>
            {judul}
          </span>
        </span>
      </h1>
      {children}
    </header>
  );
}

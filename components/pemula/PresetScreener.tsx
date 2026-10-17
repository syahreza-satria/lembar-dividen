"use client";

import { useMemo, useState } from "react";
import { TabelHasil } from "@/components/shared/TabelHasil";
import type { RingkasSaham } from "@/lib/data";
import { PRESET, terapkanFilter, type KunciField } from "@/lib/screener";

const KOLOM_PRESET: Record<string, KunciField[]> = {
  "dividen-tinggi": ["dy", "per"],
  "bank-per-rendah": ["per", "pbv", "roe"],
  "pbv-di-bawah-1": ["pbv", "per"],
  "roe-tinggi": ["roe", "per"],
  "utang-ringan": ["der", "roe"],
  "tren-naik": ["jarakMa50", "rsi14"],
  "turun-cepat": ["rsi14", "jarakMa50"],
  "golden-cross": ["jarakMa50", "rsi14"],
};

export function PresetScreener({ data }: { data: RingkasSaham[] }) {
  const [id, setId] = useState(PRESET[0].id);
  const preset = PRESET.find((p) => p.id === id)!;
  const hasil = useMemo(() => terapkanFilter(data, { ...preset.filter, urut: preset.urut }), [data, preset]);

  return (
    <div className="space-y-6">
      <div role="radiogroup" aria-label="Pilih preset" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PRESET.map((p) => {
          const aktif = p.id === id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={aktif}
              onClick={() => setId(p.id)}
              className={`kartu p-4 text-left ${
                aktif ? "!border-aksen bg-surface-2" : "gh-kartu"
              }`}
            >
              <span className="block font-judul text-base font-semibold">{p.judul}</span>
              <span className="mt-1 block text-sm text-teks-2">{p.penjelasan}</span>
            </button>
          );
        })}
      </div>

      <section aria-labelledby="hasil-preset" className="space-y-3">
        <h2 id="hasil-preset" className="judul-seksi">
          {preset.judul}
        </h2>
        <p className="text-sm text-teks-2" role="status">
          {hasil.length} dari {data.length} saham cocok.
        </p>
        <TabelHasil key={preset.id} data={hasil} kolom={KOLOM_PRESET[preset.id] ?? []} urutAwal={preset.urut} />
        <p className="text-sm text-teks-2">
          Hasil penyaringan angka, bukan rekomendasi.
        </p>
      </section>
    </div>
  );
}

"use client";

import { useId, useMemo, useState } from "react";
import { Istilah } from "@/components/shared/Istilah";
import { Hapus } from "@/components/shared/ikon";
import { TabelHasil } from "@/components/shared/TabelHasil";
import type { RingkasSaham } from "@/lib/data";
import { KONDISI, type KunciKondisi } from "@/lib/kondisi";
import { FIELD, OPERATOR, PRESET, terapkanFilter, type KunciField, type Operator, type Syarat } from "@/lib/screener";

let nomor = 0;
const idBaru = () => `s${++nomor}`;

const KOLOM_DEFAULT: KunciField[] = ["per", "pbv", "roe", "dy", "rsi14", "rasioVolume"];

export function ScreenerBebas({ data, sektor }: { data: RingkasSaham[]; sektor: string[] }) {
  const uid = useId();
  const [syarat, setSyarat] = useState<Syarat[]>(() => [{ id: idBaru(), field: "rsi14", op: "<", nilai: 30 }]);
  const [kondisi, setKondisi] = useState<KunciKondisi[]>([]);
  const [pilihSektor, setPilihSektor] = useState<string>("");

  const hasil = useMemo(
    () => terapkanFilter(data, { syarat, kondisi, sektor: pilihSektor || null }),
    [data, syarat, kondisi, pilihSektor],
  );

  const ubah = (id: string, p: Partial<Syarat>) => setSyarat((x) => x.map((y) => (y.id === id ? { ...y, ...p } : y)));

  return (
    <div className="space-y-6">
      <section aria-labelledby={`${uid}-f`} className="kartu space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`${uid}-f`} className="judul-seksi">
            Filter
          </h2>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Muat dari preset">
            <span className="text-sm text-teks-2">Mulai dari:</span>
            {PRESET.slice(0, 5).map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip cursor-pointer"
                onClick={() => {
                  setSyarat(p.filter.syarat.map((y) => ({ ...y, id: idBaru() })));
                  setKondisi(p.filter.kondisi);
                  setPilihSektor(p.filter.sektor ?? "");
                }}
              >
                {p.judul}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {syarat.length === 0 && <p className="text-sm text-teks-2">Belum ada syarat.</p>}
          {syarat.map((y, i) => (
            <div key={y.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[minmax(0,16rem)_5rem_8rem_auto]">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={`${y.id}-f`} className="sr-only-x">Field syarat {i + 1}</label>
                <select id={`${y.id}-f`} className="input" value={y.field} onChange={(e) => ubah(y.id, { field: e.target.value as KunciField })}>
                  {FIELD.map((f) => (
                    <option key={f.kunci} value={f.kunci}>{f.label}{f.satuan ? ` (${f.satuan})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${y.id}-o`} className="sr-only-x">Operator syarat {i + 1}</label>
                <select id={`${y.id}-o`} className="input angka" value={y.op} onChange={(e) => ubah(y.id, { op: e.target.value as Operator })}>
                  {OPERATOR.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${y.id}-n`} className="sr-only-x">Nilai syarat {i + 1}</label>
                <input
                  id={`${y.id}-n`}
                  type="number"
                  step="any"
                  inputMode="decimal"
                  className="input angka"
                  value={Number.isFinite(y.nilai) ? y.nilai : ""}
                  onChange={(e) => ubah(y.id, { nilai: e.target.value === "" ? NaN : Number(e.target.value) })}
                />
              </div>
              <button type="button" className="tombol tombol-ghost !px-3" aria-label={`Hapus syarat ${i + 1}`} onClick={() => setSyarat((x) => x.filter((s) => s.id !== y.id))}>
                <Hapus />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="tombol tombol-sekunder tombol-sm"
            onClick={() => setSyarat((x) => [...x, { id: idBaru(), field: "per", op: "<", nilai: 15 }])}
          >
            + Tambah syarat
          </button>
        </div>

        <fieldset>
          <legend className="label">Kondisi teknikal (semua harus terpenuhi)</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {(Object.keys(KONDISI) as KunciKondisi[]).map((k) => (
              <label key={k} className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="size-[18px] accent-white"
                  checked={kondisi.includes(k)}
                  onChange={(e) => setKondisi((x) => (e.target.checked ? [...x, k] : x.filter((z) => z !== k)))}
                />
                <Istilah k={KONDISI[k].istilah}>{KONDISI[k].label}</Istilah>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="max-w-xs">
          <label htmlFor={`${uid}-sek`} className="label">Sektor</label>
          <select id={`${uid}-sek`} className="input" value={pilihSektor} onChange={(e) => setPilihSektor(e.target.value)}>
            <option value="">Semua sektor</option>
            {sektor.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      <section aria-labelledby={`${uid}-h`} className="space-y-3">
        <h2 id={`${uid}-h`} className="judul-seksi">Hasil</h2>
        <p className="text-sm text-teks-2" role="status" aria-live="polite">
          <span className="angka text-teks">{hasil.length}</span> dari {data.length} saham memenuhi semua syarat.
        </p>
        <TabelHasil data={hasil} kolom={KOLOM_DEFAULT} urutAwal={{ kunci: "kode", arah: "naik" }} />
      </section>
    </div>
  );
}

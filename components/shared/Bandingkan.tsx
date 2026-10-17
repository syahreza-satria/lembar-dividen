"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { RingkasSaham } from "@/lib/data";
import { angka, kali, persen, rupiah } from "@/lib/format";
import { KONDISI } from "@/lib/kondisi";
import { Istilah } from "./Istilah";
import { Perubahan } from "./Perubahan";

const MAKS = 3;

export function Bandingkan({ data }: { data: RingkasSaham[] }) {
  const params = useSearchParams();
  const [kode, setKode] = useState<string[]>(() =>
    (params.get("k") ?? "")
      .split(",")
      .map((k) => k.trim().toUpperCase())
      .filter((k) => data.some((s) => s.kode === k))
      .slice(0, MAKS),
  );

  const ubah = (baru: string[]) => {
    setKode(baru);
    const url = baru.length ? `/bandingkan?k=${baru.join(",")}` : "/bandingkan";
    window.history.replaceState(null, "", url);
  };

  const terpilih = kode.map((k) => data.find((s) => s.kode === k)!).filter(Boolean);

  const baris: { label: React.ReactNode; nilai: (s: RingkasSaham) => React.ReactNode }[] = [
    { label: "Sektor", nilai: (s) => s.sektor },
    { label: "Harga", nilai: (s) => <span className="angka">{rupiah(s.harga)}</span> },
    { label: "Hari ini", nilai: (s) => <Perubahan nilai={s.perubahanPersen} /> },
    { label: <Istilah k="per">PER</Istilah>, nilai: (s) => <span className="angka">{kali(s.fundamental.per, 1)}</span> },
    { label: <Istilah k="pbv">PBV</Istilah>, nilai: (s) => <span className="angka">{kali(s.fundamental.pbv, 2)}</span> },
    { label: <Istilah k="roe">ROE</Istilah>, nilai: (s) => <span className="angka">{persen(s.fundamental.roe, 1)}</span> },
    { label: <Istilah k="der">DER</Istilah>, nilai: (s) => <span className="angka">{kali(s.fundamental.der, 2)}</span> },
    { label: <Istilah k="dividend-yield">Dividend yield</Istilah>, nilai: (s) => <span className="angka">{persen(s.fundamental.dy, 1)}</span> },
    { label: <Istilah k="rsi">RSI (14)</Istilah>, nilai: (s) => <span className="angka">{angka(s.indikator.rsi14, 0)}</span> },
    { label: "Jarak ke MA50", nilai: (s) => <Perubahan nilai={s.jarakMa50} desimal={1} /> },
    { label: "Jarak ke MA200", nilai: (s) => <Perubahan nilai={s.jarakMa200} desimal={1} /> },
    {
      label: "Kondisi teknikal",
      nilai: (s) =>
        s.kondisi.length ? (
          <span className="flex flex-wrap gap-1">{s.kondisi.map((k) => <span key={k} className="chip">{KONDISI[k].label}</span>)}</span>
        ) : (
          <span className="text-teks-2">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: MAKS }, (_, i) => (
          <div key={i}>
            <label htmlFor={`b${i}`} className="label">Saham {i + 1}</label>
            <select
              id={`b${i}`}
              className="input"
              value={kode[i] ?? ""}
              onChange={(e) => {
                const baru = [...kode];
                if (e.target.value) baru[i] = e.target.value;
                else baru.splice(i, 1);
                ubah([...new Set(baru.filter(Boolean))]);
              }}
            >
              <option value="">{i === 0 ? "Pilih saham" : "(kosong)"}</option>
              {data.map((s) => <option key={s.kode} value={s.kode}>{s.kode} — {s.nama}</option>)}
            </select>
          </div>
        ))}
      </div>

      {terpilih.length < 2 ? (
        <p className="kartu p-6 text-center text-teks-2">Pilih minimal 2 saham.</p>
      ) : (
        <div className="kartu overflow-x-auto">
          <table className="tabel">
            <caption className="sr-only-x">Perbandingan saham</caption>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only-x">Metrik</span></th>
                {terpilih.map((s) => (
                  <th key={s.kode} scope="col" className="!normal-case !tracking-normal">
                    <Link href={`/saham/${s.kode}`} className="angka text-base font-semibold text-teks gh-teks hover:underline">{s.kode}</Link>
                    <span className="block max-w-[12rem] truncate text-xs font-normal text-teks-2">{s.nama}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {baris.map((b, i) => (
                <tr key={i}>
                  <th scope="row" className="!normal-case !tracking-normal !text-sm !text-teks-2 font-normal">{b.label}</th>
                  {terpilih.map((s) => <td key={s.kode} className="!whitespace-normal">{b.nilai(s)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

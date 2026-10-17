import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotIndikator } from "./indikator";
import { hitungKondisi, type KunciKondisi } from "./kondisi";
import type { BerkasSaham, Candle, Dividen, Fundamental, Indikator, Saham } from "./types";

/** Ringkasan satu saham: cukup kecil untuk dikirim ke komponen client (screener, pencarian, dsb). */
export type RingkasSaham = {
  kode: string;
  nama: string;
  sektor: string;
  harga: number;
  perubahan: number | null;
  perubahanPersen: number | null;
  volume: number;
  rasioVolume: number | null;
  tanggal: string;
  jarakMa50: number | null;
  jarakMa200: number | null;
  /** total dividen per lembar dalam 12 bulan terakhir (relatif terhadap tanggal data) */
  dpsSetahun: number;
  fundamental: Fundamental;
  indikator: Indikator;
  kondisi: KunciKondisi[];
};

export type StatSektor = {
  sektor: string;
  jumlah: number;
  perubahanRata: number | null;
  medianPer: number | null;
  medianPbv: number | null;
  medianRoe: number | null;
  medianDy: number | null;
};

let cache: BerkasSaham | null = null;

export function muatBerkas(): BerkasSaham {
  cache ??= JSON.parse(readFileSync(join(process.cwd(), "data", "saham.json"), "utf8")) as BerkasSaham;
  return cache;
}

export function semuaSaham(): Saham[] {
  return muatBerkas().saham;
}

export function cariSaham(kode: string): Saham | undefined {
  const k = kode.toUpperCase();
  return muatBerkas().saham.find((s) => s.kode === k);
}

export function infoPembaruan() {
  const b = muatBerkas();
  return { diperbarui: b.diperbarui, sumber: b.sumber, contoh: b.contoh === true };
}

/** Tanggal acuan "hari ini" = tanggal data terakhir, bukan jam server (prerender harus deterministik). */
export function tanggalAcuan(): string {
  const tgl = semuaSaham().map((s) => s.harga.at(-1)?.t ?? "");
  return tgl.sort().at(-1) || muatBerkas().diperbarui.slice(0, 10);
}

function median(xs: (number | null)[], hanyaPositif = false): number | null {
  const v = xs.filter((x): x is number => x !== null && Number.isFinite(x) && (!hanyaPositif || x > 0)).sort((a, b) => a - b);
  if (!v.length) return null;
  const t = Math.floor(v.length / 2);
  return v.length % 2 ? v[t] : (v[t - 1] + v[t]) / 2;
}

export function perubahanHarian(harga: Candle[]) {
  const a = harga.at(-1);
  const b = harga.at(-2);
  if (!a || !b) return { perubahan: null, persen: null };
  return { perubahan: a.c - b.c, persen: ((a.c - b.c) / b.c) * 100 };
}

function satuTahunSebelum(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(y) - 1}-${m}-${d}`;
}

export function dpsSetahun(dividen: Dividen[], acuan: string): number {
  const batas = satuTahunSebelum(acuan);
  return dividen.filter((d) => d.ex > batas && d.ex <= acuan).reduce((a, d) => a + d.nilai, 0);
}

function buatRingkas(s: Saham, acuan: string): RingkasSaham {
  const akhir = s.harga[s.harga.length - 1];
  const { perubahan, persen } = perubahanHarian(s.harga);
  const ind = snapshotIndikator(s.harga);
  return {
    kode: s.kode,
    nama: s.nama,
    sektor: s.sektor,
    harga: akhir.c,
    perubahan,
    perubahanPersen: persen,
    volume: akhir.v,
    rasioVolume: ind.volRata20 ? akhir.v / ind.volRata20 : null,
    tanggal: akhir.t,
    jarakMa50: ind.ma50 ? ((akhir.c - ind.ma50) / ind.ma50) * 100 : null,
    jarakMa200: ind.ma200 ? ((akhir.c - ind.ma200) / ind.ma200) * 100 : null,
    dpsSetahun: dpsSetahun(s.dividen, acuan),
    fundamental: s.fundamental,
    indikator: ind,
    kondisi: hitungKondisi(s.harga),
  };
}

let cacheRingkas: RingkasSaham[] | null = null;

export function semuaRingkas(): RingkasSaham[] {
  cacheRingkas ??= (() => {
    const acuan = tanggalAcuan();
    return semuaSaham().map((s) => buatRingkas(s, acuan));
  })();
  return cacheRingkas;
}

export function ringkasDari(kode: string): RingkasSaham | undefined {
  return semuaRingkas().find((s) => s.kode === kode.toUpperCase());
}

let cacheSektor: StatSektor[] | null = null;

export function statSektor(): StatSektor[] {
  cacheSektor ??= (() => {
    const per = new Map<string, RingkasSaham[]>();
    for (const r of semuaRingkas()) per.set(r.sektor, [...(per.get(r.sektor) ?? []), r]);
    return [...per.entries()].map(([sektor, arr]) => {
      const p = arr.map((x) => x.perubahanPersen).filter((x): x is number => x !== null);
      return {
        sektor,
        jumlah: arr.length,
        perubahanRata: p.length ? p.reduce((a, b) => a + b, 0) / p.length : null,
        medianPer: median(arr.map((x) => x.fundamental.per), true),
        medianPbv: median(arr.map((x) => x.fundamental.pbv), true),
        medianRoe: median(arr.map((x) => x.fundamental.roe)),
        medianDy: median(arr.map((x) => x.fundamental.dy)),
      };
    });
  })();
  return cacheSektor;
}

export function statSektorDari(sektor: string): StatSektor | undefined {
  return statSektor().find((s) => s.sektor === sektor);
}

export function dataIhsg() {
  const h = muatBerkas().ihsg?.harga ?? null;
  if (!h || h.length < 2) return null;
  const { perubahan, persen } = perubahanHarian(h);
  return { harga: h, terakhir: h[h.length - 1], perubahan, persen };
}

export type ItemDividen = Dividen & { kode: string; nama: string; harga: number; yieldPersen: number };

/** Semua dividen (riwayat 12 bulan ke belakang dan yang akan datang) terurut berdasar ex date. */
export function semuaDividen(): ItemDividen[] {
  const acuan = tanggalAcuan();
  const batas = satuTahunSebelum(acuan);
  const hasil: ItemDividen[] = [];
  for (const s of semuaSaham()) {
    const harga = s.harga.at(-1)?.c ?? 0;
    for (const d of s.dividen) {
      if (d.ex < batas) continue;
      hasil.push({ ...d, kode: s.kode, nama: s.nama, harga, yieldPersen: harga ? (d.nilai / harga) * 100 : 0 });
    }
  }
  return hasil.sort((a, b) => a.ex.localeCompare(b.ex) || a.kode.localeCompare(b.kode));
}

/** Berapa tahun kalender berturut-turut (mundur dari tahun data terakhir) emiten membagi dividen. */
export function tahunBerturutDividen(dividen: Dividen[], acuan: string): number {
  const tahun = new Set(dividen.map((d) => Number(d.ex.slice(0, 4))));
  let y = Number(acuan.slice(0, 4));
  // tahun berjalan boleh belum membagi; mulai dari tahun lalu bila begitu
  if (!tahun.has(y)) y -= 1;
  let n = 0;
  while (tahun.has(y)) {
    n++;
    y--;
  }
  return n;
}

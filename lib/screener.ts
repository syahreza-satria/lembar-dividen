import type { RingkasSaham } from "./data";
import type { KunciKondisi } from "./kondisi";

export type KunciField =
  | "harga"
  | "perubahanPersen"
  | "per"
  | "pbv"
  | "roe"
  | "der"
  | "dy"
  | "rsi14"
  | "rasioVolume"
  | "jarakMa50"
  | "jarakMa200";

export type Field = { kunci: KunciField; label: string; istilah?: string; satuan: string; ambil: (s: RingkasSaham) => number | null };

export const FIELD: Field[] = [
  { kunci: "harga", label: "Harga", satuan: "Rp", ambil: (s) => s.harga },
  { kunci: "perubahanPersen", label: "Perubahan hari ini", satuan: "%", ambil: (s) => s.perubahanPersen },
  { kunci: "per", label: "PER", istilah: "per", satuan: "x", ambil: (s) => s.fundamental.per },
  { kunci: "pbv", label: "PBV", istilah: "pbv", satuan: "x", ambil: (s) => s.fundamental.pbv },
  { kunci: "roe", label: "ROE", istilah: "roe", satuan: "%", ambil: (s) => s.fundamental.roe },
  { kunci: "der", label: "DER", istilah: "der", satuan: "x", ambil: (s) => s.fundamental.der },
  { kunci: "dy", label: "Dividend yield", istilah: "dividend-yield", satuan: "%", ambil: (s) => s.fundamental.dy },
  { kunci: "rsi14", label: "RSI (14)", istilah: "rsi", satuan: "", ambil: (s) => s.indikator.rsi14 },
  { kunci: "rasioVolume", label: "Volume / rata-rata 20 hari", istilah: "volume", satuan: "x", ambil: (s) => s.rasioVolume },
  { kunci: "jarakMa50", label: "Jarak harga ke MA50", istilah: "moving-average", satuan: "%", ambil: (s) => s.jarakMa50 },
  { kunci: "jarakMa200", label: "Jarak harga ke MA200", istilah: "moving-average", satuan: "%", ambil: (s) => s.jarakMa200 },
];

export const FIELD_MAP = new Map(FIELD.map((f) => [f.kunci, f]));

export type Operator = ">" | ">=" | "<" | "<=";
export const OPERATOR: Operator[] = [">", ">=", "<", "<="];

export type Syarat = { id: string; field: KunciField; op: Operator; nilai: number };

export type Filter = {
  syarat: Omit<Syarat, "id">[];
  kondisi: KunciKondisi[];
  sektor: string | null;
  /** abaikan saham yang nilai fieldnya n/a bila ada syarat di field tsb (selalu true) */
  urut: { kunci: KunciField | "kode"; arah: "naik" | "turun" };
};

function lolos(nilai: number | null, op: Operator, batas: number): boolean {
  if (nilai === null) return false;
  switch (op) {
    case ">":
      return nilai > batas;
    case ">=":
      return nilai >= batas;
    case "<":
      return nilai < batas;
    case "<=":
      return nilai <= batas;
  }
}

export function terapkanFilter(data: RingkasSaham[], f: Omit<Filter, "urut"> & Partial<Pick<Filter, "urut">>): RingkasSaham[] {
  const hasil = data.filter((s) => {
    if (f.sektor && s.sektor !== f.sektor) return false;
    if (!f.kondisi.every((k) => s.kondisi.includes(k))) return false;
    return f.syarat.every((y) => lolos(FIELD_MAP.get(y.field)!.ambil(s), y.op, y.nilai));
  });
  return urutkan(hasil, f.urut ?? { kunci: "kode", arah: "naik" });
}

export function urutkan(data: RingkasSaham[], urut: Filter["urut"]): RingkasSaham[] {
  const k = urut.arah === "naik" ? 1 : -1;
  return [...data].sort((a, b) => {
    if (urut.kunci === "kode") return k * a.kode.localeCompare(b.kode);
    const va = FIELD_MAP.get(urut.kunci)!.ambil(a);
    const vb = FIELD_MAP.get(urut.kunci)!.ambil(b);
    if (va === null && vb === null) return 0;
    if (va === null) return 1; // n/a selalu di bawah
    if (vb === null) return -1;
    return k * (va - vb);
  });
}

export type Preset = {
  id: string;
  judul: string;
  penjelasan: string;
  filter: Omit<Filter, "urut">;
  urut: Filter["urut"];
};

export const PRESET: Preset[] = [
  {
    id: "dividen-tinggi",
    judul: "Dividen tinggi",
    penjelasan: "Saham dengan dividend yield 5% atau lebih, dari yang tertinggi.",
    filter: { syarat: [{ field: "dy", op: ">=", nilai: 5 }], kondisi: [], sektor: null },
    urut: { kunci: "dy", arah: "turun" },
  },
  {
    id: "bank-per-rendah",
    judul: "Bank dengan PER rendah",
    penjelasan: "Emiten sektor Keuangan yang membukukan laba, diurutkan dari PER terendah.",
    filter: { syarat: [{ field: "per", op: ">", nilai: 0 }], kondisi: [], sektor: "Keuangan" },
    urut: { kunci: "per", arah: "naik" },
  },
  {
    id: "pbv-di-bawah-1",
    judul: "Harga di bawah nilai buku",
    penjelasan: "Saham dengan PBV di bawah 1x, artinya harga pasar lebih rendah dari nilai buku per lembar.",
    filter: { syarat: [{ field: "pbv", op: "<", nilai: 1 }, { field: "pbv", op: ">", nilai: 0 }], kondisi: [], sektor: null },
    urut: { kunci: "pbv", arah: "naik" },
  },
  {
    id: "roe-tinggi",
    judul: "Laba efisien terhadap modal",
    penjelasan: "Saham dengan ROE 15% atau lebih, dari yang tertinggi.",
    filter: { syarat: [{ field: "roe", op: ">=", nilai: 15 }], kondisi: [], sektor: null },
    urut: { kunci: "roe", arah: "turun" },
  },
  {
    id: "utang-ringan",
    judul: "Utang ringan",
    penjelasan: "Saham dengan DER di bawah 0,5x. Sektor Keuangan tidak diikutkan karena DER bank tidak sebanding.",
    filter: { syarat: [{ field: "der", op: "<", nilai: 0.5 }], kondisi: [], sektor: null },
    urut: { kunci: "der", arah: "naik" },
  },
  {
    id: "tren-naik",
    judul: "Di atas rata-rata 50 dan 200 hari",
    penjelasan: "Harga penutupan berada di atas MA50 dan MA200, artinya tren beberapa bulan terakhir cenderung naik.",
    filter: { syarat: [], kondisi: ["di_atas_ma50", "di_atas_ma200"], sektor: null },
    urut: { kunci: "jarakMa50", arah: "turun" },
  },
  {
    id: "turun-cepat",
    judul: "Baru turun cepat (RSI < 30)",
    penjelasan: "Saham yang RSI-nya di bawah 30, artinya harga turun cepat belakangan ini.",
    filter: { syarat: [], kondisi: ["rsi_rendah"], sektor: null },
    urut: { kunci: "rsi14", arah: "naik" },
  },
  {
    id: "golden-cross",
    judul: "Baru golden cross",
    penjelasan: "Saham yang MA20-nya baru memotong ke atas MA50 pada hari data terakhir.",
    filter: { syarat: [], kondisi: ["golden_cross"], sektor: null },
    urut: { kunci: "perubahanPersen", arah: "turun" },
  },
];

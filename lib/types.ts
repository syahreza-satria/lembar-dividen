export type Candle = { t: string; o: number; h: number; l: number; c: number; v: number };

/** Semua angka nullable: null berarti "data tidak tersedia". */
export type Fundamental = {
  per: number | null;
  pbv: number | null;
  /** persen */
  roe: number | null;
  /** kali (0,5 = utang setengah dari modal sendiri) */
  der: number | null;
  eps: number | null;
  /** persen */
  margin: number | null;
  /** dividend yield, persen */
  dy: number | null;
};

export type Dividen = {
  /** tanggal ex date, YYYY-MM-DD */
  ex: string;
  /** dividen per lembar, Rupiah */
  nilai: number;
  /** tanggal bayar jika diketahui */
  bayar: string | null;
};

export type Indikator = {
  ma20: number | null;
  ma50: number | null;
  ma200: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  volRata20: number | null;
};

export type Saham = {
  kode: string;
  nama: string;
  sektor: string;
  harga: Candle[];
  fundamental: Fundamental;
  dividen: Dividen[];
  indikator: Indikator;
  diperbarui: string;
};

export type BerkasSaham = {
  diperbarui: string;
  sumber: string;
  /** true bila isi berkas hanya data contoh, bukan hasil pipeline */
  contoh?: boolean;
  ihsg: { harga: Candle[] } | null;
  saham: Saham[];
};

export type DaftarEmiten = { kode: string; nama: string; sektor: string }[];

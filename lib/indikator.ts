import type { Candle, Indikator } from "./types";

export type Seri = (number | null)[];

export function sma(nilai: number[], n: number): Seri {
  const hasil: Seri = new Array(nilai.length).fill(null);
  let jumlah = 0;
  for (let i = 0; i < nilai.length; i++) {
    jumlah += nilai[i];
    if (i >= n) jumlah -= nilai[i - n];
    if (i >= n - 1) hasil[i] = jumlah / n;
  }
  return hasil;
}

export function ema(nilai: number[], n: number): Seri {
  const hasil: Seri = new Array(nilai.length).fill(null);
  if (nilai.length < n) return hasil;
  const k = 2 / (n + 1);
  let prev = nilai.slice(0, n).reduce((a, b) => a + b, 0) / n;
  hasil[n - 1] = prev;
  for (let i = n; i < nilai.length; i++) {
    prev = nilai[i] * k + prev * (1 - k);
    hasil[i] = prev;
  }
  return hasil;
}

/** RSI metode Wilder. */
export function rsi(nilai: number[], n = 14): Seri {
  const hasil: Seri = new Array(nilai.length).fill(null);
  if (nilai.length <= n) return hasil;
  let naik = 0;
  let turun = 0;
  for (let i = 1; i <= n; i++) {
    const d = nilai[i] - nilai[i - 1];
    if (d >= 0) naik += d;
    else turun -= d;
  }
  let rataNaik = naik / n;
  let rataTurun = turun / n;
  const hitung = () => (rataTurun === 0 ? 100 : 100 - 100 / (1 + rataNaik / rataTurun));
  hasil[n] = hitung();
  for (let i = n + 1; i < nilai.length; i++) {
    const d = nilai[i] - nilai[i - 1];
    rataNaik = (rataNaik * (n - 1) + Math.max(d, 0)) / n;
    rataTurun = (rataTurun * (n - 1) + Math.max(-d, 0)) / n;
    hasil[i] = hitung();
  }
  return hasil;
}

export type SeriMacd = { macd: Seri; sinyal: Seri; hist: Seri };

export function macd(nilai: number[], cepat = 12, lambat = 26, sinyalN = 9): SeriMacd {
  const eCepat = ema(nilai, cepat);
  const eLambat = ema(nilai, lambat);
  const garis: Seri = nilai.map((_, i) =>
    eCepat[i] !== null && eLambat[i] !== null ? (eCepat[i] as number) - (eLambat[i] as number) : null,
  );
  const awal = garis.findIndex((x) => x !== null);
  const sinyal: Seri = new Array(nilai.length).fill(null);
  if (awal >= 0) {
    const potong = ema(garis.slice(awal) as number[], sinyalN);
    potong.forEach((x, i) => (sinyal[awal + i] = x));
  }
  const hist: Seri = garis.map((g, i) => (g !== null && sinyal[i] !== null ? g - (sinyal[i] as number) : null));
  return { macd: garis, sinyal, hist };
}

const akhir = <T>(a: (T | null)[]): T | null => (a.length ? a[a.length - 1] : null);

export function snapshotIndikator(harga: Candle[]): Indikator {
  const tutup = harga.map((x) => x.c);
  const m = macd(tutup);
  return {
    ma20: akhir(sma(tutup, 20)),
    ma50: akhir(sma(tutup, 50)),
    ma200: akhir(sma(tutup, 200)),
    rsi14: akhir(rsi(tutup, 14)),
    macd: akhir(m.macd),
    macdSignal: akhir(m.sinyal),
    macdHist: akhir(m.hist),
    volRata20: akhir(sma(harga.map((x) => x.v), 20)),
  };
}

/** True bila seri a memotong ke atas seri b pada bar terakhir. */
export function memotongKeAtas(a: Seri, b: Seri): boolean {
  const i = a.length - 1;
  if (i < 1) return false;
  const [a0, a1, b0, b1] = [a[i - 1], a[i], b[i - 1], b[i]];
  if (a0 === null || a1 === null || b0 === null || b1 === null) return false;
  return a0 <= b0 && a1 > b1;
}

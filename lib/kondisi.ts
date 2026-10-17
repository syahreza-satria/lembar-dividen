import { macd, memotongKeAtas, rsi, sma } from "./indikator";
import type { Candle } from "./types";

/**
 * Kondisi teknikal bersifat DESKRIPTIF: menyatakan apa yang terjadi pada data,
 * bukan apa yang sebaiknya dilakukan. Jangan menambahkan label beli/jual di sini.
 */
export const KONDISI = {
  golden_cross: { label: "Golden cross MA20/MA50", istilah: "golden-cross", deskripsi: "MA20 baru saja memotong ke atas MA50 hari ini." },
  death_cross: { label: "Death cross MA20/MA50", istilah: "death-cross", deskripsi: "MA20 baru saja memotong ke bawah MA50 hari ini." },
  rsi_rendah: { label: "RSI di bawah 30", istilah: "rsi", deskripsi: "Harga turun cepat belakangan ini (RSI di bawah 30)." },
  rsi_tinggi: { label: "RSI di atas 70", istilah: "rsi", deskripsi: "Harga naik cepat belakangan ini (RSI di atas 70)." },
  di_atas_ma50: { label: "Di atas MA50", istilah: "moving-average", deskripsi: "Harga penutupan berada di atas rata-rata 50 hari." },
  di_atas_ma200: { label: "Di atas MA200", istilah: "moving-average", deskripsi: "Harga penutupan berada di atas rata-rata 200 hari." },
  volume_tinggi: { label: "Volume tinggi", istilah: "volume", deskripsi: "Volume hari ini lebih dari 2x rata-rata 20 hari." },
  macd_naik: { label: "MACD memotong ke atas sinyal", istilah: "macd", deskripsi: "Garis MACD baru saja memotong ke atas garis sinyal." },
  macd_turun: { label: "MACD memotong ke bawah sinyal", istilah: "macd", deskripsi: "Garis MACD baru saja memotong ke bawah garis sinyal." },
} as const;

export type KunciKondisi = keyof typeof KONDISI;

export function hitungKondisi(harga: Candle[]): KunciKondisi[] {
  if (harga.length < 2) return [];
  const tutup = harga.map((x) => x.c);
  const ma20 = sma(tutup, 20);
  const ma50 = sma(tutup, 50);
  const ma200 = sma(tutup, 200);
  const r = rsi(tutup, 14).at(-1) ?? null;
  const m = macd(tutup);
  const volRata = sma(harga.map((x) => x.v), 20).at(-1) ?? null;
  const akhir = harga[harga.length - 1];
  const hasil: KunciKondisi[] = [];

  if (memotongKeAtas(ma20, ma50)) hasil.push("golden_cross");
  if (memotongKeAtas(ma50, ma20)) hasil.push("death_cross");
  if (r !== null && r < 30) hasil.push("rsi_rendah");
  if (r !== null && r > 70) hasil.push("rsi_tinggi");
  const m50 = ma50.at(-1);
  const m200 = ma200.at(-1);
  if (m50 != null && akhir.c > m50) hasil.push("di_atas_ma50");
  if (m200 != null && akhir.c > m200) hasil.push("di_atas_ma200");
  if (volRata && akhir.v > 2 * volRata) hasil.push("volume_tinggi");
  if (memotongKeAtas(m.macd, m.sinyal)) hasil.push("macd_naik");
  if (memotongKeAtas(m.sinyal, m.macd)) hasil.push("macd_turun");
  return hasil;
}

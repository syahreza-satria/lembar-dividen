import "server-only";
import { KUNCI_IHSG, KUNCI_KURS, type Kuotasi, type RespLive } from "../live-tipe";

/**
 * Kuotasi near-real-time dari Yahoo Finance (tidak resmi), satu panggilan batch untuk semua simbol.
 * Data saham IDX dari sumber ini tertunda (biasanya ±10 menit); data tanpa penundaan butuh lisensi bursa.
 * Hasil di-cache 15 detik di memori agar banyak pengunjung tidak melipatgandakan panggilan ke sumber.
 */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const HOST = "https://query1.finance.yahoo.com";
const TTL_CACHE = 15_000;
const TTL_SESI = 30 * 60_000;

type Sesi = { crumb: string; cookie: string; sampai: number };
let sesi: Promise<Sesi> | null = null;
let cache: { at: number; kunci: string; hasil: RespLive } | null = null;
let berjalan: { kunci: string; p: Promise<RespLive> } | null = null;

async function buatSesi(): Promise<Sesi> {
  const res = await fetch("https://fc.yahoo.com", { headers: { "User-Agent": UA }, redirect: "manual", signal: AbortSignal.timeout(10_000) });
  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const r2 = await fetch(`${HOST}/v1/test/getcrumb`, { headers: { "User-Agent": UA, Cookie: cookie }, signal: AbortSignal.timeout(10_000) });
  if (!r2.ok) throw new Error(`crumb HTTP ${r2.status}`);
  return { crumb: await r2.text(), cookie, sampai: Date.now() + TTL_SESI };
}

async function ambilSesi(paksa: boolean): Promise<Sesi> {
  if (paksa || !sesi) sesi = buatSesi();
  const s = await sesi;
  if (s.sampai < Date.now()) {
    sesi = buatSesi();
    return sesi;
  }
  return s;
}

type Mentah = {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  regularMarketTime?: number;
  marketState?: string;
  exchangeDataDelayedBy?: number;
};

async function panggil(simbol: string[], paksaSesi: boolean): Promise<Mentah[]> {
  const s = await ambilSesi(paksaSesi);
  const url = `${HOST}/v7/finance/quote?symbols=${encodeURIComponent(simbol.join(","))}&crumb=${encodeURIComponent(s.crumb)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Cookie: s.cookie }, signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!res.ok) throw new Error(`quote HTTP ${res.status}`);
  const j = await res.json();
  const hasil = j?.quoteResponse?.result;
  if (!Array.isArray(hasil) || hasil.length === 0) throw new Error("kuotasi kosong");
  return hasil;
}

const kunciDari = (simbol: string) => (simbol === "^JKSE" ? KUNCI_IHSG : simbol === "IDR=X" ? KUNCI_KURS : simbol.replace(/\.JK$/, ""));

async function ambilBaru(kode: string[]): Promise<RespLive> {
  const simbol = [...kode.map((k) => `${k}.JK`), "^JKSE", "IDR=X"];
  let mentah: Mentah[];
  try {
    mentah = await panggil(simbol, false);
  } catch {
    mentah = await panggil(simbol, true); // sesi/crumb mungkin kedaluwarsa
  }

  const kuotasi: Record<string, Kuotasi> = {};
  let status = "CLOSED";
  let tunda: number | null = null;
  for (const q of mentah) {
    if (typeof q.regularMarketPrice !== "number" || !(q.regularMarketPrice > 0)) continue;
    const k = kunciDari(q.symbol);
    kuotasi[k] = {
      h: q.regularMarketPrice,
      u: q.regularMarketChange ?? null,
      p: q.regularMarketChangePercent ?? null,
      v: q.regularMarketVolume ?? 0,
      t: q.regularMarketTime ?? 0,
    };
    if (k === KUNCI_IHSG && q.marketState) status = q.marketState;
    if (tunda === null && q.symbol.endsWith(".JK") && typeof q.exchangeDataDelayedBy === "number") tunda = q.exchangeDataDelayedBy;
  }
  return { waktu: Date.now(), status, tundaMenit: tunda, kuotasi };
}

export async function ambilKuotasi(kode: string[]): Promise<RespLive> {
  const kunci = kode.join(",");
  if (cache && cache.kunci === kunci && Date.now() - cache.at < TTL_CACHE) return cache.hasil;
  // Gabungkan permintaan serentak menjadi satu panggilan ke sumber.
  if (berjalan && berjalan.kunci === kunci) return berjalan.p;
  const p = ambilBaru(kode)
    .then((hasil) => {
      cache = { at: Date.now(), kunci, hasil };
      return hasil;
    })
    .finally(() => {
      berjalan = null;
    });
  berjalan = { kunci, p };
  return p;
}

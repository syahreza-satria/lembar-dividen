import type { Candle, Dividen, Fundamental } from "../types";
import type { HasilEmiten, SumberData } from "./tipe";

/**
 * Adapter Yahoo Finance (endpoint tidak resmi). Bisa berubah atau berhenti kapan saja
 * dan syarat penggunaannya membatasi redistribusi; lihat catatan di /tentang.
 */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const HOST = "https://query1.finance.yahoo.com";
const HARI_TERSIMPAN = 260;

type Mentah = { raw?: number } | number | null | undefined;
const angka = (x: Mentah): number | null => {
  const v = typeof x === "object" && x !== null ? x.raw : x;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};

/** Hanya terima angka dalam rentang masuk akal; selain itu dianggap tidak tersedia. */
const dalam = (x: number | null, min: number, maks: number) => (x !== null && x >= min && x <= maks ? x : null);

const tanggalWib = (detik: number) => new Date((detik + 7 * 3600) * 1000).toISOString().slice(0, 10);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ambilJson(url: string, opsi: RequestInit = {}, percobaan = 3): Promise<any> {
  let galat: unknown;
  for (let i = 0; i < percobaan; i++) {
    try {
      const res = await fetch(url, {
        ...opsi,
        headers: { "User-Agent": UA, ...(opsi.headers ?? {}) },
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok) return await res.json();
      galat = new Error(`HTTP ${res.status} untuk ${url}`);
    } catch (e) {
      galat = e;
    }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw galat;
}

async function ambilChart(simbol: string, range: string) {
  const j = await ambilJson(
    `${HOST}/v8/finance/chart/${encodeURIComponent(simbol)}?range=${range}&interval=1d&events=div`,
  );
  const r = j?.chart?.result?.[0];
  if (!r?.timestamp) throw new Error(`Data harga kosong untuk ${simbol}`);
  const q = r.indicators.quote[0];
  const harga: Candle[] = [];
  r.timestamp.forEach((ts: number, i: number) => {
    const [o, h, l, c, v] = [q.open[i], q.high[i], q.low[i], q.close[i], q.volume[i]];
    if ([o, h, l, c].some((x) => typeof x !== "number" || !(x > 0))) return;
    const b = (x: number) => Math.round(x * 100) / 100;
    harga.push({ t: tanggalWib(ts), o: b(o), h: b(h), l: b(l), c: b(c), v: v ?? 0 });
  });
  const dividen: Dividen[] = Object.values<{ amount: number; date: number }>(r.events?.dividends ?? {})
    .filter((d) => d.amount > 0)
    .map((d) => ({ ex: tanggalWib(d.date), nilai: d.amount, bayar: null }))
    .sort((a, b) => a.ex.localeCompare(b.ex));
  return { harga: harga.slice(-HARI_TERSIMPAN), dividen };
}

class SesiYahoo {
  private crumb: Promise<{ crumb: string; cookie: string }> | null = null;

  private async buatCrumb() {
    const res = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": UA },
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    const cookie = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    const r2 = await fetch(`${HOST}/v1/test/getcrumb`, {
      headers: { "User-Agent": UA, Cookie: cookie },
      signal: AbortSignal.timeout(20_000),
    });
    if (!r2.ok) throw new Error(`Gagal mengambil crumb: HTTP ${r2.status}`);
    return { crumb: await r2.text(), cookie };
  }

  async ringkasan(simbol: string) {
    this.crumb ??= this.buatCrumb();
    const { crumb, cookie } = await this.crumb;
    const mod = "summaryDetail,defaultKeyStatistics,financialData";
    const j = await ambilJson(
      `${HOST}/v10/finance/quoteSummary/${encodeURIComponent(simbol)}?modules=${mod}&crumb=${encodeURIComponent(crumb)}`,
      { headers: { Cookie: cookie } },
    );
    return j?.quoteSummary?.result?.[0] ?? null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function petakanFundamental(r: any): Fundamental | null {
  if (!r) return null;
  const sd = r.summaryDetail ?? {};
  const ks = r.defaultKeyStatistics ?? {};
  const fd = r.financialData ?? {};
  const roe = angka(fd.returnOnEquity);
  const margin = angka(fd.profitMargins) ?? angka(ks.profitMargins);
  const dy = angka(sd.dividendYield) ?? angka(sd.trailingAnnualDividendYield);
  const der = angka(fd.debtToEquity);
  return {
    per: dalam(angka(sd.trailingPE), 0.01, 1000),
    pbv: dalam(angka(ks.priceToBook), 0.01, 100),
    roe: roe === null ? null : dalam(roe * 100, -500, 500),
    // Yahoo melaporkan D/E dalam persen (45 = 0,45x)
    der: der === null ? null : dalam(der / 100, 0, 100),
    eps: angka(ks.trailingEps),
    margin: margin === null ? null : dalam(margin * 100, -1000, 100),
    dy: dy === null ? null : dalam(dy * 100, 0, 50),
  };
}

export function buatYahoo(): SumberData {
  const sesi = new SesiYahoo();
  return {
    nama: "Yahoo Finance (tidak resmi)",
    async ambilEmiten(kode): Promise<HasilEmiten> {
      const simbol = `${kode}.JK`;
      const chart = await ambilChart(simbol, "5y");
      let fundamental: Fundamental | null = null;
      try {
        fundamental = petakanFundamental(await sesi.ringkasan(simbol));
      } catch (e) {
        console.warn(`  ! fundamental ${kode} gagal: ${(e as Error).message}`);
      }
      return { ...chart, fundamental };
    },
    async ambilIndeks() {
      return (await ambilChart("^JKSE", "2y")).harga;
    },
    async ambilKurs() {
      // Bar Sabtu/Minggu hanyalah kuotasi datar saat pasar valas tutup; dibuang.
      return (await ambilChart("IDR=X", "1y")).harga.filter((c) => {
        const hari = new Date(`${c.t}T00:00:00Z`).getUTCDay();
        return hari !== 0 && hari !== 6;
      });
    },
  };
}

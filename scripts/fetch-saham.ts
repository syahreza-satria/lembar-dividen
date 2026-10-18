/**
 * Mengambil harga EOD + fundamental + dividen, lalu menulis data/saham.json.
 * Dijalankan GitHub Actions setiap hari bursa: npx tsx scripts/fetch-saham.ts
 *
 * Aturan ketahanan: bila satu emiten gagal, data valid terakhirnya dipertahankan.
 * Bila hasil terlalu sedikit (mis. penyedia mati), berkas lama tidak ditimpa dan skrip keluar dengan kode 1.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { snapshotIndikator } from "../lib/indikator";
import { buatYahoo } from "../lib/sumber-data/yahoo";
import type { BerkasSaham, DaftarEmiten, Saham } from "../lib/types";

const BERKAS = resolve("data/saham.json");
const DAFTAR = resolve("data/daftar-saham.json");
const BATAS_MINIMAL = 0.8; // minimal 80% emiten harus berhasil
const PARALEL = 4;

const daftar: DaftarEmiten = JSON.parse(readFileSync(DAFTAR, "utf8"));
const lama: BerkasSaham | null = existsSync(BERKAS) ? JSON.parse(readFileSync(BERKAS, "utf8")) : null;
const lamaPerKode = new Map((lama?.saham ?? []).map((s) => [s.kode, s]));
const sumber = buatYahoo();
const sekarang = new Date().toISOString();

type Hasil = { saham: Saham; baru: boolean };

async function proses(e: DaftarEmiten[number]): Promise<Hasil | null> {
  const sebelumnya = lamaPerKode.get(e.kode);
  try {
    const r = await sumber.ambilEmiten(e.kode);
    if (r.harga.length < 30) throw new Error(`hanya ${r.harga.length} hari harga`);
    return {
      baru: true,
      saham: {
        ...e,
        harga: r.harga,
        dividen: r.dividen,
        fundamental: r.fundamental ??
          sebelumnya?.fundamental ?? { per: null, pbv: null, roe: null, der: null, eps: null, margin: null, dy: null },
        indikator: snapshotIndikator(r.harga),
        diperbarui: sekarang,
      },
    };
  } catch (err) {
    console.warn(`x ${e.kode}: ${(err as Error).message}`);
    return sebelumnya ? { baru: false, saham: sebelumnya } : null;
  }
}

async function main() {
  const hasil: (Hasil | null)[] = new Array(daftar.length).fill(null);
  let kursor = 0;
  await Promise.all(
    Array.from({ length: PARALEL }, async () => {
      while (kursor < daftar.length) {
        const i = kursor++;
        hasil[i] = await proses(daftar[i]);
        if (hasil[i]?.baru) console.log(`ok ${daftar[i].kode}`);
      }
    }),
  );

  const berhasil = hasil.filter((h) => h?.baru).length;
  console.log(`\n${berhasil}/${daftar.length} emiten diperbarui`);
  if (berhasil < Math.ceil(daftar.length * BATAS_MINIMAL)) {
    console.error("Terlalu banyak kegagalan; data lama dipertahankan.");
    process.exit(1);
  }

  let ihsg = lama?.ihsg ?? null;
  try {
    ihsg = { harga: (await sumber.ambilIndeks()).slice(-260) };
  } catch (err) {
    console.warn(`x IHSG: ${(err as Error).message}`);
  }

  let kurs = lama?.kurs ?? null;
  try {
    kurs = { harga: (await sumber.ambilKurs()).slice(-260) };
  } catch (err) {
    console.warn(`x Kurs: ${(err as Error).message}`);
  }

  const keluaran: BerkasSaham = {
    diperbarui: sekarang,
    sumber: sumber.nama,
    ihsg,
    kurs,
    saham: hasil.filter((h): h is Hasil => h !== null).map((h) => h.saham),
  };
  writeFileSync(BERKAS, JSON.stringify(keluaran));
  console.log(`Tersimpan: ${BERKAS}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

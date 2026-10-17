import { angka, kali, persen, persenBertanda, rupiah, tanggal } from "./format";
import type { RingkasSaham, StatSektor } from "./data";

/**
 * Mengubah angka menjadi kalimat untuk Mode Pemula.
 * ATURAN: hanya deskriptif. Dilarang kata beli/jual, murah/mahal sebagai penilaian,
 * target harga, atau ajakan apa pun (lihat "Batasan hukum" di PRD).
 */

type Pembanding = "lebih tinggi dari" | "lebih rendah dari" | "mirip dengan";

function banding(x: number, acuan: number, toleransi = 0.1): Pembanding {
  if (x > acuan * (1 + toleransi)) return "lebih tinggi dari";
  if (x < acuan * (1 - toleransi)) return "lebih rendah dari";
  return "mirip dengan";
}

export type KonteksPenjelasan = {
  sektor: StatSektor | undefined;
  tahunDividenBerturut: number;
};

export function ringkasanSaham(s: RingkasSaham, k: KonteksPenjelasan): string[] {
  const kal: string[] = [];
  const { fundamental: f, indikator: i } = s;
  const bank = s.sektor === "Keuangan";

  // 1. Pergerakan harga
  if (s.perubahanPersen !== null) {
    const arah = s.perubahanPersen > 0 ? "naik" : s.perubahanPersen < 0 ? "turun" : "tidak berubah";
    const besar = s.perubahanPersen === 0 ? "" : ` ${angka(Math.abs(s.perubahanPersen), 1)}%`;
    let kalimat = `${s.kode} ditutup di ${rupiah(s.harga)}, ${arah}${besar} pada ${tanggal(s.tanggal)}.`;
    if (k.sektor?.perubahanRata != null && k.sektor.jumlah > 1) {
      kalimat += ` Rata-rata sektor ${s.sektor} pada hari yang sama ${persenBertanda(k.sektor.perubahanRata, 1)}.`;
    }
    kal.push(kalimat);
  } else {
    kal.push(`${s.kode} ditutup di ${rupiah(s.harga)} pada ${tanggal(s.tanggal)}.`);
  }

  // 2. Valuasi
  if (f.per !== null && k.sektor?.medianPer != null) {
    kal.push(
      `PER-nya ${kali(f.per, 1)}, ${banding(f.per, k.sektor.medianPer)} nilai tengah sektor ${s.sektor} (${kali(k.sektor.medianPer, 1)}).`,
    );
  } else if (f.eps !== null && f.eps < 0) {
    kal.push("Perusahaan sedang mencatat rugi, sehingga PER tidak bisa dihitung.");
  }
  if (f.pbv !== null) {
    kal.push(
      f.pbv < 1
        ? `PBV ${kali(f.pbv, 2)}: harga saham berada di bawah nilai buku perusahaan.`
        : `PBV ${kali(f.pbv, 2)}: harga saham sekitar ${angka(f.pbv, 1)} kali nilai buku perusahaan.`,
    );
  }

  // 3. Profitabilitas dan utang
  if (f.roe !== null) {
    kal.push(`ROE ${persen(f.roe, 1)}: tiap Rp 100 modal pemegang saham menghasilkan laba sekitar Rp ${angka(f.roe, 0)} per tahun.`);
  }
  if (!bank && f.der !== null) {
    kal.push(`DER ${kali(f.der, 2)}: utang perusahaan sekitar ${angka(f.der, 2)} kali modal sendirinya.`);
  }

  // 4. Dividen
  if (f.dy !== null && f.dy > 0) {
    let kalimat = `Dividend yield ${persen(f.dy, 1)}`;
    kalimat += k.tahunDividenBerturut >= 2 ? `, dan membagi dividen ${k.tahunDividenBerturut} tahun berturut-turut.` : ".";
    kal.push(kalimat);
  } else if (f.dy === 0 || (f.dy === null && s.dpsSetahun === 0)) {
    kal.push("Tidak ada pembagian dividen tercatat dalam 12 bulan terakhir.");
  }

  // 5. Tren dan momentum
  const tren: string[] = [];
  if (i.ma50 !== null) {
    tren.push(
      s.harga > i.ma50
        ? `Harga berada di atas rata-rata 50 hari (${rupiah(i.ma50)}), artinya tren beberapa minggu terakhir cenderung naik.`
        : `Harga berada di bawah rata-rata 50 hari (${rupiah(i.ma50)}), artinya tren beberapa minggu terakhir cenderung turun.`,
    );
  }
  if (i.ma200 !== null) {
    tren.push(
      s.harga > i.ma200
        ? "Dibanding rata-rata 200 hari, harga masih berada di atasnya."
        : "Dibanding rata-rata 200 hari, harga masih berada di bawahnya.",
    );
  }
  if (tren.length) kal.push(tren.join(" "));

  if (i.rsi14 !== null) {
    kal.push(
      i.rsi14 >= 70
        ? `RSI ${angka(i.rsi14, 0)}: harga naik cepat belakangan ini.`
        : i.rsi14 <= 30
          ? `RSI ${angka(i.rsi14, 0)}: harga turun cepat belakangan ini.`
          : `RSI ${angka(i.rsi14, 0)}: pergerakan harga belakangan ini berada di rentang yang wajar.`,
    );
  }
  if (s.rasioVolume !== null && s.rasioVolume >= 1.5) {
    kal.push(`Volume hari ini ${angka(s.rasioVolume, 1)} kali rata-rata 20 hari, lebih ramai dari biasanya.`);
  }
  return kal;
}

export type KartuAngka = {
  kunci: "per" | "pbv" | "roe" | "der" | "dy";
  istilah: string;
  nilai: string;
  penjelasan: string;
};

/** 4–5 angka utama untuk Mode Pemula, masing-masing dengan penjelasan satu kalimat. */
export function kartuFundamental(s: RingkasSaham, sektor: StatSektor | undefined): KartuAngka[] {
  const f = s.fundamental;
  const kartu: KartuAngka[] = [];
  const NA = "Data tidak tersedia.";

  kartu.push({
    kunci: "per",
    istilah: "per",
    nilai: kali(f.per, 1),
    penjelasan:
      f.per === null
        ? f.eps !== null && f.eps < 0
          ? "Perusahaan sedang rugi, jadi PER tidak bisa dihitung."
          : NA
        : `Harga setara ${angka(f.per, 1)} kali laba setahun${
            sektor?.medianPer != null ? `; ${banding(f.per, sektor.medianPer)} nilai tengah sektor (${kali(sektor.medianPer, 1)})` : ""
          }.`,
  });
  kartu.push({
    kunci: "pbv",
    istilah: "pbv",
    nilai: kali(f.pbv, 2),
    penjelasan:
      f.pbv === null
        ? NA
        : f.pbv < 1
          ? "Harga saham di bawah nilai buku (modal bersih) per lembar."
          : `Harga saham sekitar ${angka(f.pbv, 1)} kali nilai buku per lembar.`,
  });
  kartu.push({
    kunci: "roe",
    istilah: "roe",
    nilai: persen(f.roe, 1),
    penjelasan: f.roe === null ? NA : `Tiap Rp 100 modal pemegang saham menghasilkan laba sekitar Rp ${angka(f.roe, 0)} per tahun.`,
  });
  if (s.sektor !== "Keuangan") {
    kartu.push({
      kunci: "der",
      istilah: "der",
      nilai: kali(f.der, 2),
      penjelasan: f.der === null ? NA : `Utang sekitar ${angka(f.der, 2)} kali modal sendiri.`,
    });
  }
  kartu.push({
    kunci: "dy",
    istilah: "dividend-yield",
    nilai: persen(f.dy, 1),
    penjelasan:
      f.dy === null
        ? NA
        : f.dy === 0
          ? "Tidak ada dividen dalam 12 bulan terakhir."
          : `Dividen setahun setara ${angka(f.dy, 1)}% dari harga saham saat ini.`,
  });
  return kartu;
}

/** Kalimat netral untuk label hasil preset screener. */
export function deskripsiHarga(s: RingkasSaham): string {
  return `${rupiah(s.harga)} (${persenBertanda(s.perubahanPersen, 1)})`;
}

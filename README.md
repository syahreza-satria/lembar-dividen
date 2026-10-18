# Lembar Dividen

Web app gratis untuk membaca saham IDX: **Mode Pemula** (penjelasan bahasa sederhana) dan **Mode Pro** (candlestick, indikator, screener bebas). Tema gelap saja, mengikuti `design-system.md`. Lihat PRD untuk detail produk.

## Menjalankan

```bash
npm install
npm run dev                          # http://localhost:3000
npx tsx scripts/fetch-saham.ts       # ambil data terbaru ke data/saham.json
node --import tsx --test lib/indikator.test.ts
node scripts/buat-ikon.mjs           # buat ulang ikon PWA
```

## Struktur

- `lib/indikator.ts` MA, RSI, MACD (ada tes). `lib/penjelasan.ts` angka menjadi kalimat Mode Pemula. `lib/kondisi.ts` penanda teknikal deskriptif.
- `lib/sumber-data/` adapter penyedia data (saat ini Yahoo Finance tidak resmi). Ganti penyedia dengan mengimplementasikan `SumberData`.
- `data/daftar-saham.json` emiten yang dicakup (kode, nama, sektor). Tambah baris untuk memperluas cakupan.
- `data/saham.json` hasil pipeline harian (`.github/workflows/fetch-saham.yml`, 16.30 WIB). Menyimpan 260 hari harga per saham.
- Mode Pemula/Pro: atribut `data-mode` di `<html>`, diset skrip inline sebelum hydration; kelas `.hanya-pemula` / `.hanya-pro`.

## Data live

`/api/kuotasi` mengambil kuotasi near-real-time (semua saham + IHSG + kurs) dari Yahoo dalam satu panggilan batch, cache 15 detik di server. Klien (`lib/live.ts`) polling tiap 20 detik saat bursa buka, 5 menit saat tutup, dan hanya saat tab terlihat. Bila gagal, UI kembali ke data penutupan. Sumber melaporkan penundaan ±10 menit untuk saham IDX; data tanpa jeda memerlukan lisensi bursa. Grafik, indikator, dan fundamental tetap dari data penutupan harian.

## Aturan konten

Semua teks bersifat deskriptif. Tidak boleh ada rekomendasi beli/jual, target harga, atau label sinyal.

## Catatan

- Sumber data bukan layanan resmi dan syaratnya membatasi redistribusi; tinjau sebelum rilis publik.
- Set `NEXT_PUBLIC_SITE_URL` untuk sitemap, robots, dan metadata.

import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import Link from "next/link";
import { infoPembaruan, semuaSaham, tanggalAcuan } from "@/lib/data";
import { tanggal, waktuWib } from "@/lib/format";
import { DISCLAIMER } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Tentang, metode, dan disclaimer",
  description: "Cara Lembar Dividen menghitung angka, sumber data, batasan, dan disclaimer.",
};

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="judul-seksi mb-3">{children}</h2>;

export default function Tentang() {
  const info = infoPembaruan();
  return (
    <article className="space-y-10 lg:space-y-14 leading-relaxed">
      <KepalaHalaman nomor="07" label="Tentang" judul="Tentang Lembar Dividen">
        <p className="teks-pengantar">
          Web app gratis untuk membaca saham IDX: penjelasan sederhana untuk pemula, candlestick dan screener untuk trader.
        </p>
      </KepalaHalaman>

      <section aria-labelledby="disc" className="kartu border-peringatan/40 p-5">
        <h2 id="disc" className="judul-seksi mb-2">Disclaimer</h2>
        <p>{DISCLAIMER}</p>
        <p className="mt-3 text-teks-2">
          Alat edukasi dan informasi, bukan penasihat investasi. Tidak ada rekomendasi beli/jual, target harga, atau sinyal.
        </p>
      </section>

      <section aria-labelledby="mode">
        <H2>Mode Pemula dan Mode Pro</H2>
        <p>
          Data sama, dua tampilan. Pemula: kalimat dan grafik garis. Pro: nilai mentah, candlestick, indikator, filter bebas. Pilihan disimpan di perangkat ini.
        </p>
      </section>

      <section aria-labelledby="metode">
        <H2>Metode</H2>
        <ul className="list-disc space-y-2 pl-5 text-teks/90">
          <li>Harga penutupan harian (EOD), bukan real-time.</li>
          <li>MA20/50/200 = rata-rata sederhana harga tutup. RSI metode Wilder (14). MACD EMA 12/26, sinyal EMA 9.</li>
          <li>Median sektor dihitung dari saham yang tercakup di sini.</li>
          <li>Ringkasan dibuat otomatis dari template, selalu deskriptif.</li>
          <li>Cum date: perkiraan satu hari bursa sebelum ex date.</li>
          <li>Angka di luar rentang wajar ditampilkan n/a.</li>
        </ul>
      </section>

      <section aria-labelledby="sumber">
        <H2>Sumber data</H2>
        <p>
          Diambil sekali sehari setelah bursa tutup dari <strong>{info.sumber}</strong>. Cakupan saat ini {semuaSaham().length} saham
          likuid. Harga terakhir per <strong>{tanggal(tanggalAcuan())}</strong>, berkas data diperbarui {waktuWib(info.diperbarui)}.
        </p>
        <p className="mt-3 text-teks-2">
          Sumber tidak resmi dan syaratnya membatasi redistribusi. Data bisa tertunda atau keliru; cocokkan dengan sumber resmi. Jika pengambilan data gagal, data valid terakhir tetap tampil dengan tanggalnya.
        </p>
      </section>

      <section aria-labelledby="privasi">
        <H2>Privasi</H2>
        <p>
          Tanpa login, tanpa pelacakan pihak ketiga. Mode dan watchlist hanya tersimpan di browser ini.
        </p>
      </section>

      <p>
        <Link href="/belajar" className="text-aksen underline underline-offset-4">Belajar istilah saham</Link>
      </p>
    </article>
  );
}

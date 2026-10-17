import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KartuFundamental } from "@/components/pemula/KartuFundamental";
import { RingkasanSaham } from "@/components/pemula/RingkasanSaham";
import { TabelFundamental, TabelIndikator } from "@/components/pro/TabelFundamental";
import { GrafikSaham } from "@/components/shared/GrafikSaham";
import { KondisiTeknikal } from "@/components/shared/KondisiTeknikal";
import { Perubahan } from "@/components/shared/Perubahan";
import { TombolWatchlist } from "@/components/shared/TombolWatchlist";
import {
  cariSaham,
  ringkasDari,
  semuaSaham,
  statSektorDari,
  tahunBerturutDividen,
  tanggalAcuan,
} from "@/lib/data";
import { angka, persenBertanda, ringkasBesar, rupiah, tanggal } from "@/lib/format";
import { kartuFundamental, ringkasanSaham } from "@/lib/penjelasan";

export function generateStaticParams() {
  return semuaSaham().map((s) => ({ kode: s.kode }));
}

export async function generateMetadata({ params }: PageProps<"/saham/[kode]">): Promise<Metadata> {
  const { kode } = await params;
  const r = ringkasDari(kode);
  if (!r) return {};
  const judul = `Saham ${r.kode} — ${r.nama}`;
  const deskripsi = `${r.kode} ditutup di ${rupiah(r.harga)} (${persenBertanda(r.perubahanPersen, 1)}) pada ${tanggal(r.tanggal)}. Fundamental, grafik, indikator teknikal, dan riwayat dividen ${r.nama} dengan penjelasan bahasa sederhana.`;
  return {
    title: judul,
    description: deskripsi,
    alternates: { canonical: `/saham/${r.kode}` },
    openGraph: { title: judul, description: deskripsi, type: "article", locale: "id_ID" },
  };
}

export default async function HalamanSaham({ params }: PageProps<"/saham/[kode]">) {
  const { kode } = await params;
  const saham = cariSaham(kode);
  const r = ringkasDari(kode);
  if (!saham || !r) notFound();

  const sektor = statSektorDari(r.sektor);
  const acuan = tanggalAcuan();
  const berturut = tahunBerturutDividen(saham.dividen, acuan);
  const kalimat = ringkasanSaham(r, { sektor, tahunDividenBerturut: berturut });
  const kartu = kartuFundamental(r, sektor);

  const akhir = saham.harga[saham.harga.length - 1];
  const tinggi52 = Math.max(...saham.harga.map((h) => h.h));
  const rendah52 = Math.min(...saham.harga.map((h) => h.l));
  const riwayat = [...saham.dividen].reverse().slice(0, 10);

  return (
    <article className="space-y-12 lg:space-y-16">
      <header data-kepala className="space-y-6 border-b border-garis pb-10">
        <p className="label-mono" data-label>
          {r.sektor} {"//"} IDX: {r.kode}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="tampil">
              <span className="topeng">
                <span className="topeng-isi" data-reveal>
                  {r.kode}
                </span>
              </span>
            </h1>
            <p className="teks-pengantar mt-1">{r.nama}</p>
            <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="angka text-[clamp(1.75rem,4vw,2.5rem)] font-medium">{rupiah(r.harga)}</span>
              <Perubahan nilai={r.perubahanPersen} className="text-lg" />
              {r.perubahan !== null && (
                <span className="angka text-sm text-teks-2">
                  ({r.perubahan > 0 ? "+" : r.perubahan < 0 ? "−" : ""}
                  {angka(Math.abs(r.perubahan))})
                </span>
              )}
            </p>
            <p className="label-mono mt-2 !text-[10px]">Harga tutup {tanggal(r.tanggal)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TombolWatchlist kode={r.kode} />
            <Link href={`/bandingkan?k=${r.kode}`} className="tombol tombol-sekunder tombol-sm">
              Bandingkan
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
      <div className="hanya-pemula lg:col-span-5">
        <RingkasanSaham kalimat={kalimat} />
      </div>

      <section aria-labelledby="grafik" className="kartu kolom-grafik p-4 sm:p-6">
        <h2 id="grafik" className="judul-seksi mb-4">
          Grafik harga
        </h2>
        <GrafikSaham kode={r.kode} harga={saham.harga} />
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-garis pt-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="label-mono !text-[10px] mb-1">Rentang 1 tahun</dt>
            <dd className="angka">
              {angka(rendah52)} – {angka(tinggi52)}
            </dd>
          </div>
          <div className="hanya-pro">
            <dt className="label-mono !text-[10px] mb-1">Buka / Tinggi / Rendah</dt>
            <dd className="angka">
              {angka(akhir.o)} / {angka(akhir.h)} / {angka(akhir.l)}
            </dd>
          </div>
          <div>
            <dt className="label-mono !text-[10px] mb-1">Volume</dt>
            <dd className="angka">{ringkasBesar(akhir.v)} lembar</dd>
          </div>
          <div>
            <dt className="label-mono !text-[10px] mb-1">Rata-rata volume 20 hari</dt>
            <dd className="angka">{ringkasBesar(r.indikator.volRata20)} lembar</dd>
          </div>
        </dl>
      </section>
      </div>

      <section aria-labelledby="fundamental" className="space-y-5">
        <h2 id="fundamental" className="judul-seksi">
          Fundamental
        </h2>
        <div className="hanya-pemula">
          <KartuFundamental kartu={kartu} />
        </div>
        <div className="hanya-pro">
          <TabelFundamental s={r} sektor={sektor} />
        </div>
      </section>

      <section aria-labelledby="teknikal" className="space-y-5">
        <h2 id="teknikal" className="judul-seksi">
          Kondisi teknikal
        </h2>
        <KondisiTeknikal kondisi={r.kondisi} />
        <div className="hanya-pro">
          <TabelIndikator s={r} />
        </div>
        <p className="hanya-pemula text-sm text-teks-2">
          Deskripsi data harga, bukan saran.
        </p>
      </section>

      <section aria-labelledby="dividen" className="space-y-5">
        <h2 id="dividen" className="judul-seksi">
          Riwayat dividen
        </h2>
        {riwayat.length === 0 ? (
          <p className="kartu p-4 text-sm text-teks-2">Tidak ada dividen tercatat dalam data yang tersedia.</p>
        ) : (
          <div className="kartu overflow-x-auto">
            <table className="tabel">
              <caption className="sr-only-x">Riwayat dividen {r.kode}</caption>
              <thead>
                <tr>
                  <th scope="col">Ex date</th>
                  <th scope="col" className="kanan">Dividen / lembar</th>
                  <th scope="col" className="kanan">Setara harga sekarang</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((d) => (
                  <tr key={d.ex}>
                    <td>{tanggal(d.ex)}</td>
                    <td className="angka kanan">{rupiah(d.nilai, d.nilai % 1 ? 2 : 0)}</td>
                    <td className="angka kanan text-teks-2">{angka((d.nilai / r.harga) * 100, 2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-sm text-teks-2">
          {berturut >= 2 ? `Membagi dividen ${berturut} tahun berturut-turut. ` : ""}
          Lihat juga <Link href="/dividen" className="text-white underline underline-offset-4">kalender dividen</Link> dan{" "}
          <Link href="/kalkulator" className="text-white underline underline-offset-4">kalkulator simulasi dividen</Link>.
        </p>
      </section>
    </article>
  );
}

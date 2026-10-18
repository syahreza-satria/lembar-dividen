import Link from "next/link";
import { Istilah } from "@/components/shared/Istilah";
import { HargaLive, PerubahanLive } from "@/components/shared/HargaLive";
import { JudulKartu as Judul } from "@/components/shared/JudulKartu";
import { DaftarPerforma, SektorLive } from "@/components/shared/PasarLive";
import { StatusPasar } from "@/components/shared/StatusPasar";
import { Sparkline } from "@/components/shared/Sparkline";
import { dataIhsg, dataKurs, semuaDividen, semuaRingkas, tanggalAcuan } from "@/lib/data";
import { persen, rupiah, tanggal } from "@/lib/format";
import { KONDISI } from "@/lib/kondisi";

export default function Beranda() {
  const semua = semuaRingkas();
  const dataPasar = semua.map((s) => ({ kode: s.kode, nama: s.nama, sektor: s.sektor, harga: s.harga, persen: s.perubahanPersen }));
  const ihsg = dataIhsg();
  const kurs = dataKurs();
  const acuan = tanggalAcuan();
  const semuaDiv = semuaDividen();
  const mendatang = semuaDiv.filter((d) => d.ex >= acuan);
  const dividenMendatang = mendatang.length ? mendatang.slice(0, 6) : semuaDiv.filter((d) => d.ex < acuan).slice(-6).reverse();
  const sorotan = (["golden_cross", "rsi_rendah", "volume_tinggi"] as const).map((k) => ({
    k,
    kode: semua.filter((s) => s.kondisi.includes(k)).map((s) => s.kode),
  }));

  return (
    <div className="space-y-12 lg:space-y-14">
      {/* Hero */}
      <section data-kepala className="hanya-pemula">
        <div>
          <p className="label-mono" data-label>01 {"//"} Mode Pemula</p>
          <h1 className="tampil mt-6">
            <span className="topeng">
              <span className="topeng-isi" data-reveal>Baca saham IDX</span>
            </span>
            <span className="topeng">
              <span className="topeng-isi" data-reveal>dengan bahasa sederhana.</span>
            </span>
          </h1>
          <p data-masuk className="teks-pengantar mt-6">
            Setiap angka dijelaskan: dari <Istilah k="saham">apa itu saham</Istilah> sampai <Istilah k="per">PER</Istilah> dan{" "}
            <Istilah k="dividend-yield">dividend yield</Istilah>.
          </p>
          <div data-masuk className="mt-8 flex flex-wrap gap-3">
            <Link href="/screener" className="tombol tombol-utama">Buka preset screener</Link>
            <Link href="/belajar" className="tombol tombol-sekunder">Belajar istilah dasar</Link>
          </div>
        </div>
      </section>

      <header data-kepala className="hanya-pro space-y-4">
        <p className="label-mono" data-label>01 {"//"} Mode Pro</p>
        <h1 className="judul-halaman">
          <span className="topeng"><span className="topeng-isi" data-reveal>Ringkasan pasar</span></span>
        </h1>
      </header>

      {/* Bento */}
      <div className="grid gap-4 lg:grid-cols-12">
        {ihsg && (
          <section aria-labelledby="ihsg" className="kartu-terang p-6 lg:col-span-7 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="ihsg" className="label-mono">
                <Istilah k="ihsg">IHSG</Istilah>
              </h2>
              <StatusPasar />
            </div>
            <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <HargaLive kode="IHSG" fallback={ihsg.terakhir.c} desimal={2} className="angka text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-none" />
              <PerubahanLive kode="IHSG" fallback={ihsg.persen} className="text-lg" />
            </p>
            <div className="mt-8">
              <Sparkline data={ihsg.harga.slice(-90).map((h) => h.c)} label="Pergerakan IHSG 90 hari terakhir" terang />
              <p className="label-mono mt-2 !text-[10px]">90 hari bursa terakhir</p>
            </div>
            {kurs && (
              <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-garis pt-6">
                <div>
                  <h3 className="label-mono">Kurs USD/IDR</h3>
                  <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <HargaLive kode="USDIDR" fallback={kurs.terakhir.c} awalan="Rp " className="angka text-[clamp(1.5rem,3vw,2rem)] font-medium leading-none" />
                    <PerubahanLive kode="USDIDR" fallback={kurs.persen} />
                  </p>
                </div>
                <div className="w-40 sm:w-56">
                  <Sparkline data={kurs.harga.slice(-90).map((h) => h.c)} label="Pergerakan kurs USD/IDR 90 hari terakhir" tinggi={48} terang />
                </div>
              </div>
            )}
          </section>
        )}

        <SektorLive data={dataPasar} className="lg:col-span-5" />

        <DaftarPerforma judul="Performa terbaik" id="gainer" nomor="03-B" mode="terbaik" data={dataPasar} className="lg:col-span-4" />
        <DaftarPerforma judul="Performa terburuk" id="loser" nomor="03-C" mode="terburuk" data={dataPasar} className="lg:col-span-4" />

        <section aria-labelledby="dividen-dekat" className="kartu overflow-hidden lg:col-span-4">
          <Judul id="dividen-dekat" nomor="04-D">{mendatang.length ? "Dividen berikutnya" : "Dividen terakhir"}</Judul>
          {dividenMendatang.length === 0 ? (
            <p className="p-5 text-sm text-teks-2">Belum ada ex date setelah {tanggal(acuan)}.</p>
          ) : (
            <ul>
              {dividenMendatang.map((d) => (
                <li key={`${d.kode}${d.ex}`} className="border-b border-garis last:border-0">
                  <Link href={`/saham/${d.kode}`} className="gh-bg flex min-h-14 flex-wrap items-center gap-x-4 gap-y-0 px-5 py-2">
                    <span className="angka w-12 font-semibold">{d.kode}</span>
                    <span className="text-sm text-teks-2">{tanggal(d.ex)}</span>
                    <span className="angka ml-auto text-sm">
                      {rupiah(d.nilai, d.nilai % 1 ? 2 : 0)} <span className="text-teks-2">{persen(d.yieldPersen, 1)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-garis px-5 py-3">
            <Link href="/dividen" className="label-mono gh-teks">Kalender lengkap →</Link>
          </div>
        </section>

        <section aria-labelledby="sorotan" className="kartu hanya-pro lg:col-span-12">
          <Judul id="sorotan" nomor="05-E">Kondisi teknikal hari ini</Judul>
          <dl className="grid gap-5 p-5 text-sm md:grid-cols-3">
            {sorotan.map(({ k, kode }) => (
              <div key={k} className="space-y-2">
                <dt className="label-mono">{KONDISI[k].label}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {kode.length === 0 ? (
                    <span className="text-teks-2">Tidak ada</span>
                  ) : (
                    kode.map((c) => (
                      <Link key={c} href={`/saham/${c}`} className="chip">{c}</Link>
                    ))
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

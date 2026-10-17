import Link from "next/link";
import { Istilah } from "@/components/shared/Istilah";
import { Perubahan } from "@/components/shared/Perubahan";
import { Sparkline } from "@/components/shared/Sparkline";
import { dataIhsg, semuaDividen, semuaRingkas, statSektor, tanggalAcuan, type RingkasSaham } from "@/lib/data";
import { angka, persen, rupiah, tanggal } from "@/lib/format";
import { KONDISI } from "@/lib/kondisi";

function Judul({ nomor, children, id }: { nomor: string; children: React.ReactNode; id: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-garis px-5 py-4">
      <h2 id={id} className="text-lg font-medium">
        {children}
      </h2>
      <span className="label-mono !text-[10px]">{nomor}</span>
    </div>
  );
}

function DaftarSaham({ judul, id, nomor, data, className }: { judul: string; id: string; nomor: string; data: RingkasSaham[]; className: string }) {
  return (
    <section aria-labelledby={id} className={`kartu overflow-hidden ${className}`}>
      <Judul id={id} nomor={nomor}>{judul}</Judul>
      <ol>
        {data.map((s) => (
          <li key={s.kode} className="border-b border-garis last:border-0">
            <Link href={`/saham/${s.kode}`} className="gh-bg flex min-h-14 items-center gap-3 px-5 py-2">
              <span className="angka w-12 font-semibold">{s.kode}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-teks-2">{s.nama}</span>
              <span className="angka hidden text-sm sm:inline">{angka(s.harga)}</span>
              <Perubahan nilai={s.perubahanPersen} className="w-24 justify-end text-sm" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Beranda() {
  const semua = semuaRingkas();
  const urut = [...semua].filter((s) => s.perubahanPersen !== null).sort((a, b) => (b.perubahanPersen ?? 0) - (a.perubahanPersen ?? 0));
  const gainer = urut.slice(0, 5);
  const loser = urut.slice(-5).reverse();
  const ihsg = dataIhsg();
  const sektor = [...statSektor()].filter((s) => s.perubahanRata !== null).sort((a, b) => (b.perubahanRata ?? 0) - (a.perubahanRata ?? 0));
  const maks = Math.max(...sektor.map((s) => Math.abs(s.perubahanRata ?? 0)), 0.01);
  const acuan = tanggalAcuan();
  const dividenMendatang = semuaDividen().filter((d) => d.ex >= acuan).slice(0, 6);
  const sorotan = (["golden_cross", "rsi_rendah", "volume_tinggi"] as const).map((k) => ({
    k,
    kode: semua.filter((s) => s.kondisi.includes(k)).map((s) => s.kode),
  }));

  return (
    <div className="space-y-16 lg:space-y-20">
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
            <h2 id="ihsg" className="label-mono">
              <Istilah k="ihsg">IHSG</Istilah> {"//"} {tanggal(ihsg.terakhir.t)}
            </h2>
            <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="angka text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-none">{angka(ihsg.terakhir.c, 2)}</span>
              <Perubahan nilai={ihsg.persen} className="text-lg" />
            </p>
            <div className="mt-8">
              <Sparkline data={ihsg.harga.slice(-90).map((h) => h.c)} label="Pergerakan IHSG 90 hari terakhir" terang />
              <p className="label-mono mt-2 !text-[10px]">90 hari bursa terakhir</p>
            </div>
          </section>
        )}

        <section aria-labelledby="sektor" className="kartu overflow-hidden lg:col-span-5">
          <Judul id="sektor" nomor="02-A">Sektor hari ini</Judul>
          <ul className="space-y-3 p-5">
            {sektor.map((s) => {
              const v = s.perubahanRata ?? 0;
              return (
                <li key={s.sektor} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_auto]">
                  <span className="truncate text-teks-2">{s.sektor}</span>
                  <span className="relative h-1.5 rounded-full bg-surface-3" aria-hidden>
                    <span className="absolute inset-y-0 left-1/2 w-px bg-garis-kuat" />
                    <span
                      data-bar={v >= 0 ? "kiri" : "kanan"}
                      className={`absolute inset-y-0 rounded-full ${v >= 0 ? "bg-naik" : "bg-turun"}`}
                      style={v >= 0 ? { left: "50%", width: `${(v / maks) * 50}%` } : { right: "50%", width: `${(-v / maks) * 50}%` }}
                    />
                  </span>
                  <Perubahan nilai={s.perubahanRata} className="w-24 justify-end" />
                </li>
              );
            })}
          </ul>
        </section>

        <DaftarSaham judul="Naik terbanyak" id="gainer" nomor="03-B" data={gainer} className="lg:col-span-4" />
        <DaftarSaham judul="Turun terbanyak" id="loser" nomor="03-C" data={loser} className="lg:col-span-4" />

        <section aria-labelledby="dividen-dekat" className="kartu overflow-hidden lg:col-span-4">
          <Judul id="dividen-dekat" nomor="04-D">Dividen berikutnya</Judul>
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

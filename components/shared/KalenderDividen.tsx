"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { ItemDividen } from "@/lib/data";
import { hariKerjaSebelum, namaBulan, persen, rupiah, tanggal } from "@/lib/format";
import { useWatchlist } from "@/lib/watchlist";
import { Istilah } from "./Istilah";
import { Masuk } from "./Masuk";
import { TombolWatchlist } from "./TombolWatchlist";

export type ItemKalender = ItemDividen & { sektor: string };

type Jenis = "ex" | "cum";
type Kejadian = { jenis: Jenis; item: ItemKalender };
type Tampilan = "kalender" | "daftar";
type Urutan = "ex" | "yield" | "dps";

const NAMA_HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const pad = (n: number) => String(n).padStart(2, "0");
const bulanDari = (iso: string) => iso.slice(0, 7);

function geserBulan(ym: string, d: number) {
  const [y, m] = ym.split("-").map(Number);
  const t = y * 12 + (m - 1) + d;
  return `${Math.floor(t / 12)}-${pad((t % 12) + 1)}`;
}

function bentukBulan(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const hari = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const awal = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Senin = 0
  return { hari, awal };
}

const dps = (n: number) => rupiah(n, n % 1 ? 2 : 0);

export function KalenderDividen({ data, acuan }: { data: ItemKalender[]; acuan: string }) {
  const uid = useId();
  const { daftar: watchlist } = useWatchlist();

  const [tampilan, setTampilan] = useState<Tampilan>("kalender");
  const [bulan, setBulan] = useState(bulanDari(acuan));
  const [pilih, setPilih] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sektor, setSektor] = useState("");
  const [minYield, setMinYield] = useState(0);
  const [hanyaWatch, setHanyaWatch] = useState(false);
  const [tampilCum, setTampilCum] = useState(false);
  const [urut, setUrut] = useState<Urutan>("ex");

  const semuaSektor = useMemo(() => [...new Set(data.map((d) => d.sektor))].sort(), [data]);
  const batasBulan = useMemo(() => {
    const semua = [...data.map((d) => bulanDari(d.ex)), bulanDari(acuan)].sort();
    return { awal: semua[0], akhir: semua[semua.length - 1] };
  }, [data, acuan]);

  const lolos = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return data.filter(
      (d) =>
        (!kata || d.kode.toLowerCase().includes(kata) || d.nama.toLowerCase().includes(kata)) &&
        (!sektor || d.sektor === sektor) &&
        d.yieldPersen >= minYield &&
        (!hanyaWatch || watchlist.includes(d.kode)),
    );
  }, [data, q, sektor, minYield, hanyaWatch, watchlist]);

  const filterAktif = !!(q || sektor || minYield || hanyaWatch);
  const resetFilter = () => {
    setQ("");
    setSektor("");
    setMinYield(0);
    setHanyaWatch(false);
  };

  // Kejadian per tanggal (ex date, dan cum date perkiraan bila diminta).
  const perHari = useMemo(() => {
    const m = new Map<string, Kejadian[]>();
    const tambah = (hari: string, k: Kejadian) => m.set(hari, [...(m.get(hari) ?? []), k]);
    for (const item of lolos) {
      tambah(item.ex, { jenis: "ex", item });
      if (tampilCum) tambah(hariKerjaSebelum(item.ex), { jenis: "cum", item });
    }
    for (const [h, arr] of m) m.set(h, arr.sort((a, b) => (a.jenis === b.jenis ? b.item.yieldPersen - a.item.yieldPersen : a.jenis === "ex" ? -1 : 1)));
    return m;
  }, [lolos, tampilCum]);

  const { hari: jumlahHari, awal } = bentukBulan(bulan);
  const kunciHari = (h: number) => `${bulan}-${pad(h)}`;
  const hariBerEvent = Array.from({ length: jumlahHari }, (_, i) => kunciHari(i + 1)).filter((k) => perHari.has(k));
  const hariAktif = pilih && pilih.startsWith(bulan) ? pilih : (hariBerEvent[0] ?? null);
  const kejadianAktif = hariAktif ? (perHari.get(hariAktif) ?? []) : [];

  const exBulanIni = lolos.filter((d) => bulanDari(d.ex) === bulan);
  const tertinggi = exBulanIni.reduce<ItemKalender | null>((a, d) => (!a || d.yieldPersen > a.yieldPersen ? d : a), null);

  const keJadwalBerikut = () => {
    const urutan = [...lolos].sort((a, b) => a.ex.localeCompare(b.ex));
    const target = urutan.find((d) => d.ex >= acuan) ?? urutan[urutan.length - 1];
    if (!target) return;
    setBulan(bulanDari(target.ex));
    setPilih(target.ex);
  };

  const bisaMundur = bulan > batasBulan.awal;
  const bisaMaju = bulan < batasBulan.akhir;

  // ---- Daftar ----
  const daftar = useMemo(() => {
    const arr = [...lolos];
    if (urut === "yield") return arr.sort((a, b) => b.yieldPersen - a.yieldPersen);
    if (urut === "dps") return arr.sort((a, b) => b.nilai - a.nilai);
    return arr.sort((a, b) => a.ex.localeCompare(b.ex));
  }, [lolos, urut]);

  const kelompokDaftar = useMemo(() => {
    if (urut !== "ex") return [{ judul: urut === "yield" ? "Urut yield tertinggi" : "Urut dividen per lembar", item: daftar }];
    const mendatang = daftar.filter((d) => d.ex >= acuan);
    const riwayat = daftar.filter((d) => d.ex < acuan);
    const per = new Map<string, ItemKalender[]>();
    for (const d of [...riwayat].reverse()) per.set(bulanDari(d.ex), [...(per.get(bulanDari(d.ex)) ?? []), d]);
    return [
      ...(mendatang.length ? [{ judul: "Akan datang", item: mendatang }] : []),
      ...[...per.entries()].map(([b, item]) => ({ judul: namaBulan(b), item })),
    ];
  }, [daftar, urut, acuan]);

  return (
    <div className="space-y-6">
      {/* Kontrol */}
      <section aria-label="Tampilan dan filter" className="kartu space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="radiogroup" aria-label="Tampilan" className="inline-flex rounded-full border border-garis-kuat/60 bg-surface p-1">
            {(["kalender", "daftar"] as Tampilan[]).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tampilan === t}
                onClick={() => setTampilan(t)}
                className={`label-mono min-h-[32px] rounded-full px-4 ${tampilan === t ? "!bg-white !text-[#050505]" : "gh-nav"}`}
              >
                {t === "kalender" ? "Kalender" : "Daftar"}
              </button>
            ))}
          </div>
          <p className="label-mono" role="status" aria-live="polite">
            {lolos.length} dari {data.length} jadwal
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto]">
          <div>
            <label htmlFor={`${uid}-q`} className="label">Cari saham</label>
            <input id={`${uid}-q`} type="search" className="input" placeholder="Kode atau nama" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${uid}-s`} className="label">Sektor</label>
            <select id={`${uid}-s`} className="input" value={sektor} onChange={(e) => setSektor(e.target.value)}>
              <option value="">Semua sektor</option>
              {semuaSektor.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-y`} className="label">Yield minimum</label>
            <select id={`${uid}-y`} className="input" value={minYield} onChange={(e) => setMinYield(Number(e.target.value))}>
              <option value={0}>Semua</option>
              {[1, 2, 3, 5].map((v) => <option key={v} value={v}>≥ {v}% per pembayaran</option>)}
            </select>
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="size-[18px] accent-white" checked={hanyaWatch} onChange={(e) => setHanyaWatch(e.target.checked)} />
              Watchlist
            </label>
            {tampilan === "kalender" && (
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" className="size-[18px] accent-white" checked={tampilCum} onChange={(e) => setTampilCum(e.target.checked)} />
                <Istilah k="cum-date">Cum date</Istilah>
              </label>
            )}
          </div>
        </div>

        {filterAktif && (
          <button type="button" className="tombol tombol-ghost tombol-sm" onClick={resetFilter}>
            Hapus filter
          </button>
        )}
      </section>

      {tampilan === "kalender" ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <section aria-labelledby={`${uid}-bln`} className="kartu overflow-hidden lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <button type="button" className="tombol tombol-sekunder tombol-sm !px-3" aria-label="Bulan sebelumnya" disabled={!bisaMundur} onClick={() => setBulan(geserBulan(bulan, -1))}>
                  ←
                </button>
                <h2 id={`${uid}-bln`} className="min-w-[10.5rem] text-center text-lg font-medium" aria-live="polite">
                  {namaBulan(bulan)}
                </h2>
                <button type="button" className="tombol tombol-sekunder tombol-sm !px-3" aria-label="Bulan berikutnya" disabled={!bisaMaju} onClick={() => setBulan(geserBulan(bulan, 1))}>
                  →
                </button>
              </div>
              <div className="flex gap-2">
                <button type="button" className="tombol tombol-ghost tombol-sm" onClick={() => { setBulan(bulanDari(acuan)); setPilih(null); }}>
                  Bulan data terbaru
                </button>
                <button type="button" className="tombol tombol-sekunder tombol-sm" onClick={keJadwalBerikut} disabled={lolos.length === 0}>
                  Jadwal berikutnya
                </button>
              </div>
            </div>

            <Masuk key={bulan} y={10}>
              <div className="px-2 pb-2 pt-3 sm:px-4 sm:pb-4">
                <div className="grid grid-cols-7 pb-1">
                  {NAMA_HARI.map((h, i) => (
                    <span key={h} className={`label-mono py-2 text-center !text-[10px] ${i > 4 ? "opacity-50" : ""}`}>{h}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[8px] border border-garis bg-garis">
                  {Array.from({ length: awal }, (_, i) => <div key={`k${i}`} className="min-h-[64px] bg-bg/60 md:min-h-[104px]" aria-hidden />)}
                  {Array.from({ length: jumlahHari }, (_, i) => {
                    const h = i + 1;
                    const kunci = kunciHari(h);
                    const kej = perHari.get(kunci) ?? [];
                    const akhirPekan = (awal + i) % 7 > 4;
                    const dipilih = kunci === hariAktif;
                    const adaData = kunci === acuan;
                    const dasar = `relative flex min-h-[64px] flex-col gap-1 p-1.5 text-left md:min-h-[104px] md:p-2 ${akhirPekan ? "bg-surface" : "bg-surface-2"}`;
                    const nomor = (
                      <span className={`angka flex items-center gap-1 text-xs ${kej.length ? "font-semibold text-teks" : "text-teks-2"}`}>
                        {adaData ? <span className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[11px] text-[#050505]" title="Tanggal data terakhir">{h}</span> : h}
                      </span>
                    );
                    if (!kej.length) return <div key={kunci} className={dasar}>{nomor}</div>;
                    const ex = kej.filter((k) => k.jenis === "ex");
                    return (
                      <button
                        key={kunci}
                        type="button"
                        aria-pressed={dipilih}
                        aria-label={`${h} ${namaBulan(bulan)}: ${ex.length} ex date${kej.length > ex.length ? `, ${kej.length - ex.length} cum date perkiraan` : ""}`}
                        onClick={() => setPilih(kunci)}
                        className={`${dasar} gh-bg ${dipilih ? "!bg-surface-3 shadow-[inset_0_0_0_1.5px_#fff]" : ""}`}
                      >
                        {nomor}
                        <span className="hidden flex-wrap gap-1 md:flex">
                          {kej.slice(0, 2).map((k) => (
                            <span key={`${k.jenis}${k.item.kode}`} className={`chip !px-2 !py-0.5 !text-[10px] ${k.jenis === "cum" ? "!border-dashed !text-teks-2" : ""}`}>
                              {k.item.kode}
                            </span>
                          ))}
                          {kej.length > 2 && <span className="label-mono self-center !text-[10px]">+{kej.length - 2}</span>}
                        </span>
                        <span className="mt-auto flex gap-0.5 md:hidden" aria-hidden>
                          {kej.slice(0, 4).map((k) => <span key={`${k.jenis}${k.item.kode}`} className={`size-1.5 rounded-full ${k.jenis === "cum" ? "border border-teks-2" : "bg-white"}`} />)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="label-mono mt-3 flex flex-wrap gap-x-5 gap-y-1 !text-[10px]">
                  <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-white" /> Ex date</span>
                  {tampilCum && <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full border border-teks-2" /> Cum date (perkiraan)</span>}
                  <span className="inline-flex items-center gap-1.5"><span className="inline-flex size-4 items-center justify-center rounded-full bg-white text-[9px] text-[#050505]">•</span> Tanggal data terakhir</span>
                </p>
              </div>
            </Masuk>

            <div className="grid grid-cols-3 border-t border-garis text-sm">
              {[
                ["Jadwal bulan ini", String(exBulanIni.length)],
                ["Yield tertinggi", tertinggi ? `${tertinggi.kode} ${persen(tertinggi.yieldPersen, 2)}` : "—"],
                ["Rata-rata yield", exBulanIni.length ? persen(exBulanIni.reduce((a, d) => a + d.yieldPersen, 0) / exBulanIni.length, 2) : "—"],
              ].map(([k, v]) => (
                <div key={k} className="border-r border-garis px-4 py-3 last:border-0">
                  <p className="label-mono !text-[10px]">{k}</p>
                  <p className="angka mt-1">{v}</p>
                </div>
              ))}
            </div>
          </section>

          <aside aria-labelledby={`${uid}-det`} className="kartu overflow-hidden lg:col-span-4 lg:self-start lg:sticky lg:top-28">
            <div className="border-b border-garis px-5 py-4">
              <p className="label-mono !text-[10px]">Detail tanggal</p>
              <h2 id={`${uid}-det`} className="mt-1 text-lg font-medium">{hariAktif ? tanggal(hariAktif) : "Tidak ada jadwal"}</h2>
            </div>
            <Masuk key={hariAktif ?? "kosong"} y={8}>
              {kejadianAktif.length === 0 ? (
                <p className="p-5 text-sm text-teks-2">
                  {hariBerEvent.length === 0 ? `Tidak ada jadwal di ${namaBulan(bulan)}${filterAktif ? " dengan filter ini" : ""}.` : "Pilih tanggal yang bertanda untuk melihat detail."}
                </p>
              ) : (
                <ul>
                  {kejadianAktif.map((k) => (
                    <li key={`${k.jenis}${k.item.kode}`} className="border-b border-garis px-5 py-4 last:border-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/saham/${k.item.kode}`} className="angka gh-teks font-semibold underline-offset-4 hover:underline">{k.item.kode}</Link>
                          <p className="truncate text-sm text-teks-2">{k.item.nama}</p>
                        </div>
                        <TombolWatchlist kode={k.item.kode} kecil />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`chip ${k.jenis === "cum" ? "!border-dashed" : "chip-sukses"}`}>{k.jenis === "ex" ? "Ex date" : "Cum date (perkiraan)"}</span>
                        <span className="chip">{k.item.sektor}</span>
                      </div>
                      <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                        <div><dt className="label-mono !text-[10px]">Per lembar</dt><dd className="angka">{dps(k.item.nilai)}</dd></div>
                        <div><dt className="label-mono !text-[10px]">Yield</dt><dd className="angka">{persen(k.item.yieldPersen, 2)}</dd></div>
                        <div><dt className="label-mono !text-[10px]">Bayar</dt><dd className="text-teks-2">{k.item.bayar ? tanggal(k.item.bayar) : "n/a"}</dd></div>
                      </dl>
                      {k.jenis === "cum" && <p className="mt-2 text-xs text-teks-2">Ex date: {tanggal(k.item.ex)}</p>}
                      {k.jenis === "ex" && <p className="mt-2 text-xs text-teks-2">Cum date (perkiraan): {tanggal(hariKerjaSebelum(k.item.ex))}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Masuk>
          </aside>
        </div>
      ) : (
        <Masuk y={10}>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor={`${uid}-u`} className="label !mb-0">Urutkan</label>
              <select id={`${uid}-u`} className="input !w-auto" value={urut} onChange={(e) => setUrut(e.target.value as Urutan)}>
                <option value="ex">Tanggal ex date</option>
                <option value="yield">Yield tertinggi</option>
                <option value="dps">Dividen per lembar</option>
              </select>
            </div>
            {lolos.length === 0 && <p className="kartu p-6 text-center text-teks-2">Tidak ada jadwal yang cocok dengan filter.</p>}
            {kelompokDaftar.map((g) => (
              <section key={g.judul} className="space-y-3" aria-label={g.judul}>
                <h2 className="judul-seksi">{g.judul}</h2>
                <div className="kartu overflow-x-auto">
                  <table className="tabel">
                    <thead>
                      <tr>
                        <th scope="col"><span className="sr-only-x">Watchlist</span></th>
                        <th scope="col">Saham</th>
                        <th scope="col"><Istilah k="cum-date">Cum date*</Istilah></th>
                        <th scope="col"><Istilah k="ex-date">Ex date</Istilah></th>
                        <th scope="col"><Istilah k="tanggal-bayar">Bayar</Istilah></th>
                        <th scope="col" className="kanan">Per lembar</th>
                        <th scope="col" className="kanan">Yield</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.item.map((d) => (
                        <tr key={`${d.kode}${d.ex}`}>
                          <td className="!py-1"><TombolWatchlist kode={d.kode} kecil /></td>
                          <td>
                            <Link href={`/saham/${d.kode}`} className="angka gh-teks font-semibold hover:underline">{d.kode}</Link>
                            <span className="ml-3 hidden text-teks-2 md:inline">{d.nama}</span>
                          </td>
                          <td className="text-teks-2">{tanggal(hariKerjaSebelum(d.ex))}</td>
                          <td>
                            {tanggal(d.ex)}
                            {d.ex >= acuan && <span className="chip chip-sukses ml-2">Akan datang</span>}
                          </td>
                          <td className="text-teks-2">{d.bayar ? tanggal(d.bayar) : "n/a"}</td>
                          <td className="angka kanan">{dps(d.nilai)}</td>
                          <td className="angka kanan text-teks-2">{persen(d.yieldPersen, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </Masuk>
      )}
    </div>
  );
}

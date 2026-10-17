"use client";

import { useId, useMemo, useState } from "react";
import { Istilah } from "./Istilah";
import { Hapus } from "./ikon";
import { Masuk } from "./Masuk";
import { angka, persen, rupiah } from "@/lib/format";

export type OpsiSaham = { kode: string; nama: string; harga: number; dpsSetahun: number };

type Tab = "fee" | "dividen" | "average";
const TAB: { id: Tab; label: string }[] = [
  { id: "fee", label: "Fee beli/jual" },
  { id: "dividen", label: "Simulasi dividen" },
  { id: "average", label: "Average down" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));

function Bidang({
  label,
  nilai,
  setNilai,
  bantuan,
  satuan,
  step = "any",
}: {
  label: string;
  nilai: string;
  setNilai: (v: string) => void;
  bantuan?: string;
  satuan?: string;
  step?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min="0"
          className={`input angka ${satuan ? "pr-12" : ""}`}
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          aria-describedby={bantuan ? `${id}-b` : undefined}
        />
        {satuan && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-teks-2">{satuan}</span>}
      </div>
      {bantuan && <p id={`${id}-b`} className="bantuan">{bantuan}</p>}
    </div>
  );
}

function Baris({ label, nilai, tebal = false }: { label: React.ReactNode; nilai: string; tebal?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-b border-garis py-2.5 last:border-0 ${tebal ? "font-semibold" : ""}`}>
      <dt className={tebal ? "" : "text-teks-2"}>{label}</dt>
      <dd className="angka text-right">{nilai}</dd>
    </div>
  );
}

function FeeBeliJual() {
  const [harga, setHarga] = useState("5000");
  const [lot, setLot] = useState("10");
  const [hargaJual, setHargaJual] = useState("5250");
  const [feeBeli, setFeeBeli] = useState("0.15");
  const [feeJual, setFeeJual] = useState("0.25");

  const h = useMemo(() => {
    const [p, l, pj, fb, fj] = [num(harga), num(lot), num(hargaJual), num(feeBeli), num(feeJual)];
    if ([p, l, pj, fb, fj].some((x) => !Number.isFinite(x) || x < 0)) return null;
    const lembar = l * 100;
    const nilaiBeli = p * lembar;
    const nilaiJual = pj * lembar;
    const biayaBeli = (nilaiBeli * fb) / 100;
    const biayaJual = (nilaiJual * fj) / 100;
    const modal = nilaiBeli + biayaBeli;
    const bersih = nilaiJual - biayaJual;
    const selisih = bersih - modal;
    const titikImpas = lembar > 0 ? (modal / lembar) / (1 - fj / 100) : 0;
    return { lembar, nilaiBeli, nilaiJual, biayaBeli, biayaJual, modal, bersih, selisih, pct: modal ? (selisih / modal) * 100 : 0, titikImpas };
  }, [harga, lot, hargaJual, feeBeli, feeJual]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Bidang label="Harga beli per lembar" nilai={harga} setNilai={setHarga} satuan="Rp" />
        <Bidang label="Jumlah lot" nilai={lot} setNilai={setLot} satuan="lot" bantuan="1 lot = 100 lembar." />
        <Bidang label="Harga jual per lembar" nilai={hargaJual} setNilai={setHargaJual} satuan="Rp" />
        <div className="grid grid-cols-2 gap-3">
          <Bidang label="Fee beli" nilai={feeBeli} setNilai={setFeeBeli} satuan="%" />
          <Bidang label="Fee jual (termasuk pajak)" nilai={feeJual} setNilai={setFeeJual} satuan="%" />
        </div>
        <p className="bantuan">
          Fee contoh; sesuaikan dengan sekuritasmu.
        </p>
      </div>
      <div className="kartu p-5" aria-live="polite">
        {h ? (
          <dl>
            <Baris label="Jumlah lembar" nilai={angka(h.lembar)} />
            <Baris label="Nilai beli" nilai={rupiah(h.nilaiBeli)} />
            <Baris label="Fee beli" nilai={rupiah(h.biayaBeli)} />
            <Baris label="Total modal keluar" nilai={rupiah(h.modal)} tebal />
            <Baris label="Nilai jual" nilai={rupiah(h.nilaiJual)} />
            <Baris label="Fee jual" nilai={rupiah(h.biayaJual)} />
            <Baris label="Uang diterima" nilai={rupiah(h.bersih)} tebal />
            <Baris
              label="Selisih bersih"
              nilai={`${h.selisih > 0 ? "+" : h.selisih < 0 ? "−" : ""}${rupiah(Math.abs(h.selisih))} (${h.pct > 0 ? "+" : h.pct < 0 ? "−" : ""}${persen(Math.abs(h.pct), 2)})`}
              tebal
            />
            <Baris label="Harga jual impas (setelah fee)" nilai={rupiah(h.titikImpas, 1)} />
          </dl>
        ) : (
          <p className="text-sm text-teks-2">Isi semua kolom dengan angka ≥ 0.</p>
        )}
      </div>
    </div>
  );
}

function SimulasiDividen({ saham }: { saham: OpsiSaham[] }) {
  const id = useId();
  const [kode, setKode] = useState(saham[0]?.kode ?? "");
  const pilih = saham.find((s) => s.kode === kode);
  const [lot, setLot] = useState("10");
  const [dps, setDps] = useState(() => String(Math.round((saham[0]?.dpsSetahun ?? 0) * 100) / 100));
  const [pajak, setPajak] = useState("10");

  const ganti = (k: string) => {
    setKode(k);
    const s = saham.find((x) => x.kode === k);
    if (s) setDps(String(Math.round(s.dpsSetahun * 100) / 100));
  };

  const [l, d, p] = [num(lot), num(dps), num(pajak)];
  const sah = [l, d, p].every((x) => Number.isFinite(x) && x >= 0);
  const lembar = l * 100;
  const kotor = lembar * d;
  const potongan = (kotor * p) / 100;
  const modal = (pilih?.harga ?? 0) * lembar;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label htmlFor={id} className="label">Saham</label>
          <select id={id} className="input" value={kode} onChange={(e) => ganti(e.target.value)}>
            {saham.map((s) => <option key={s.kode} value={s.kode}>{s.kode} — {s.nama}</option>)}
          </select>
        </div>
        <Bidang label="Jumlah lot" nilai={lot} setNilai={setLot} satuan="lot" bantuan="10 lot = 1.000 lembar." />
        <Bidang
          label="Dividen per lembar (setahun)"
          nilai={dps}
          setNilai={setDps}
          satuan="Rp"
          bantuan="Default: total dividen 12 bulan terakhir. Bisa diubah."
        />
        <Bidang
          label="Pajak dividen"
          nilai={pajak}
          setNilai={setPajak}
          satuan="%"
          bantuan="Contoh 10%; sesuaikan dengan ketentuanmu."
        />
      </div>
      <div className="kartu p-5" aria-live="polite">
        {sah && pilih ? (
          <dl>
            <Baris label="Lembar dimiliki" nilai={angka(lembar)} />
            <Baris label="Modal pada harga terakhir" nilai={rupiah(modal)} />
            <Baris label={<Istilah k="dividen">Dividen</Istilah>} nilai={rupiah(kotor)} />
            <Baris label="Potongan pajak" nilai={`−${rupiah(potongan)}`} />
            <Baris label="Diterima" nilai={rupiah(kotor - potongan)} tebal />
            <Baris label={<Istilah k="dividend-yield">Yield bersih terhadap modal</Istilah>} nilai={persen(modal ? ((kotor - potongan) / modal) * 100 : 0, 2)} />
          </dl>
        ) : (
          <p className="text-sm text-teks-2">Isi semua kolom dengan angka ≥ 0.</p>
        )}
      </div>
    </div>
  );
}

type Pembelian = { id: number; lot: string; harga: string };
let seq = 2;

function AverageDown() {
  const [beli, setBeli] = useState<Pembelian[]>([
    { id: 1, lot: "10", harga: "5000" },
    { id: 2, lot: "10", harga: "4500" },
  ]);
  const [harga, setHarga] = useState("4500");
  const [feeBeli, setFeeBeli] = useState("0.15");

  const h = useMemo(() => {
    const fee = num(feeBeli);
    const baris = beli.map((b) => ({ l: num(b.lot), p: num(b.harga) }));
    if (!Number.isFinite(fee) || baris.some((b) => !Number.isFinite(b.l) || !Number.isFinite(b.p) || b.l < 0 || b.p < 0)) return null;
    const lembar = baris.reduce((a, b) => a + b.l * 100, 0);
    const nilai = baris.reduce((a, b) => a + b.l * 100 * b.p, 0);
    const biaya = nilai * (1 + fee / 100);
    const rata = lembar ? biaya / lembar : 0;
    const sekarang = num(harga);
    return { lembar, nilai, biaya, rata, nilaiSekarang: Number.isFinite(sekarang) ? sekarang * lembar : NaN, sekarang };
  }, [beli, harga, feeBeli]);

  const ubah = (id: number, p: Partial<Pembelian>) => setBeli((x) => x.map((y) => (y.id === id ? { ...y, ...p } : y)));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <fieldset className="space-y-3">
          <legend className="label">Pembelian</legend>
          {beli.map((b, i) => (
            <div key={b.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <div>
                <label htmlFor={`l${b.id}`} className="bantuan !mt-0">Lot ke-{i + 1}</label>
                <input id={`l${b.id}`} type="number" min="0" inputMode="decimal" className="input angka" value={b.lot} onChange={(e) => ubah(b.id, { lot: e.target.value })} />
              </div>
              <div>
                <label htmlFor={`h${b.id}`} className="bantuan !mt-0">Harga ke-{i + 1} (Rp)</label>
                <input id={`h${b.id}`} type="number" min="0" inputMode="decimal" className="input angka" value={b.harga} onChange={(e) => ubah(b.id, { harga: e.target.value })} />
              </div>
              <button type="button" className="tombol tombol-ghost !px-3" aria-label={`Hapus pembelian ${i + 1}`} disabled={beli.length <= 1} onClick={() => setBeli((x) => x.filter((y) => y.id !== b.id))}>
                <Hapus />
              </button>
            </div>
          ))}
          <button type="button" className="tombol tombol-sekunder tombol-sm" onClick={() => setBeli((x) => [...x, { id: ++seq, lot: "10", harga: "" }])}>
            + Tambah pembelian
          </button>
        </fieldset>
        <Bidang label="Fee beli" nilai={feeBeli} setNilai={setFeeBeli} satuan="%" />
        <Bidang label="Harga saat ini (opsional)" nilai={harga} setNilai={setHarga} satuan="Rp" bantuan="Untuk nilai posisi saat ini." />
      </div>
      <div className="kartu p-5" aria-live="polite">
        {h ? (
          <dl>
            <Baris label="Total lembar" nilai={angka(h.lembar)} />
            <Baris label="Total nilai pembelian" nilai={rupiah(h.nilai)} />
            <Baris label="Total dengan fee" nilai={rupiah(h.biaya)} />
            <Baris label={<Istilah k="average-down">Harga rata-rata per lembar</Istilah>} nilai={rupiah(h.rata, 1)} tebal />
            {Number.isFinite(h.nilaiSekarang) && (
              <>
                <Baris label="Nilai posisi di harga saat ini" nilai={rupiah(h.nilaiSekarang)} />
                <Baris
                  label="Selisih terhadap modal (sebelum fee jual)"
                  nilai={`${h.nilaiSekarang - h.biaya > 0 ? "+" : h.nilaiSekarang - h.biaya < 0 ? "−" : ""}${rupiah(Math.abs(h.nilaiSekarang - h.biaya))}`}
                />
              </>
            )}
          </dl>
        ) : (
          <p className="text-sm text-teks-2">Isi semua kolom dengan angka ≥ 0.</p>
        )}
      </div>
    </div>
  );
}

export function Kalkulator({ saham }: { saham: OpsiSaham[] }) {
  const [tab, setTab] = useState<Tab>("fee");
  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Jenis kalkulator" className="flex flex-wrap gap-2">
        {TAB.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`tombol tombol-sm ${tab === t.id ? "tombol-aktif" : "tombol-sekunder"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        <Masuk key={tab}>
          {tab === "fee" && <FeeBeliJual />}
          {tab === "dividen" && <SimulasiDividen saham={saham} />}
          {tab === "average" && <AverageDown />}
        </Masuk>
      </div>
      <p className="text-sm text-teks-2">
        Hitungan matematis, bukan prediksi atau saran.
      </p>
    </div>
  );
}

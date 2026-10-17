import { Istilah } from "@/components/shared/Istilah";
import { angka, kali, persen, rupiah } from "@/lib/format";
import type { RingkasSaham, StatSektor } from "@/lib/data";

export function TabelFundamental({ s, sektor }: { s: RingkasSaham; sektor: StatSektor | undefined }) {
  const f = s.fundamental;
  const baris = [
    { k: "per", n: "PER", v: kali(f.per, 2), m: kali(sektor?.medianPer, 2) },
    { k: "pbv", n: "PBV", v: kali(f.pbv, 2), m: kali(sektor?.medianPbv, 2) },
    { k: "roe", n: "ROE", v: persen(f.roe, 2), m: persen(sektor?.medianRoe, 2) },
    { k: "der", n: "DER", v: kali(f.der, 2), m: "—" },
    { k: "eps", n: "EPS", v: rupiah(f.eps, 2), m: "—" },
    { k: "margin-laba", n: "Margin laba", v: persen(f.margin, 2), m: "—" },
    { k: "dividend-yield", n: "Dividend yield", v: persen(f.dy, 2), m: persen(sektor?.medianDy, 2) },
  ];
  return (
    <div className="kartu overflow-x-auto">
      <table className="tabel">
        <caption className="sr-only-x">Fundamental {s.kode}</caption>
        <thead>
          <tr>
            <th scope="col">Rasio</th>
            <th scope="col" className="kanan">{s.kode}</th>
            <th scope="col" className="kanan">Median sektor {s.sektor}</th>
          </tr>
        </thead>
        <tbody>
          {baris.map((b) => (
            <tr key={b.k}>
              <th scope="row" className="!normal-case !tracking-normal !text-teks !text-sm font-medium">
                <Istilah k={b.k}>{b.n}</Istilah>
              </th>
              <td className="angka kanan">{b.v}</td>
              <td className="angka kanan text-teks-2">{b.m}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TabelIndikator({ s }: { s: RingkasSaham }) {
  const i = s.indikator;
  const baris = [
    { k: "moving-average", n: "MA20", v: rupiah(i.ma20, 0) },
    { k: "moving-average", n: "MA50", v: rupiah(i.ma50, 0) },
    { k: "moving-average", n: "MA200", v: rupiah(i.ma200, 0) },
    { k: "rsi", n: "RSI (14)", v: angka(i.rsi14, 1) },
    { k: "macd", n: "MACD", v: angka(i.macd, 2) },
    { k: "macd", n: "Sinyal MACD (9)", v: angka(i.macdSignal, 2) },
    { k: "macd", n: "Histogram MACD", v: angka(i.macdHist, 2) },
    { k: "volume", n: "Volume / rata-rata 20 hari", v: s.rasioVolume === null ? "n/a" : `${angka(s.rasioVolume, 2)}x` },
  ];
  return (
    <div className="kartu overflow-x-auto">
      <table className="tabel">
        <caption className="sr-only-x">Indikator teknikal {s.kode}</caption>
        <thead>
          <tr>
            <th scope="col">Indikator</th>
            <th scope="col" className="kanan">Nilai</th>
          </tr>
        </thead>
        <tbody>
          {baris.map((b) => (
            <tr key={b.n}>
              <th scope="row" className="!normal-case !tracking-normal !text-teks !text-sm font-medium">
                <Istilah k={b.k}>{b.n}</Istilah>
              </th>
              <td className="angka kanan">{b.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

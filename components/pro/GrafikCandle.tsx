"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { macd, rsi, sma } from "@/lib/indikator";
import type { Candle } from "@/lib/types";

const RENTANG = [
  { id: "1B", hari: 21 },
  { id: "3B", hari: 63 },
  { id: "6B", hari: 126 },
  { id: "1T", hari: 260 },
] as const;

const OVERLAY = [
  { id: "ma20", label: "MA20", warna: "#38bdf8", n: 20 },
  { id: "ma50", label: "MA50", warna: "#eab308", n: 50 },
  { id: "ma200", label: "MA200", warna: "#a78bfa", n: 200 },
] as const;

type Panel = "volume" | "rsi" | "macd";

const garis = (seri: (number | null)[], harga: Candle[]) =>
  seri.flatMap((v, i) => (v === null ? [] : [{ time: harga[i].t as Time, value: v }]));

export default function GrafikCandle({ kode, harga }: { kode: string; harga: Candle[] }) {
  const wadah = useRef<HTMLDivElement>(null);
  const [rentang, setRentang] = useState<(typeof RENTANG)[number]["id"]>("6B");
  const [ma, setMa] = useState<Record<string, boolean>>({ ma20: true, ma50: true, ma200: false });
  const [panel, setPanel] = useState<Record<Panel, boolean>>({ volume: true, rsi: true, macd: false });

  useEffect(() => {
    if (!wadah.current) return;
    const hari = RENTANG.find((r) => r.id === rentang)!.hari;
    const chart = createChart(wadah.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa",
        fontFamily: "var(--font-jbmono), ui-monospace, monospace",
        panes: { separatorColor: "#27272a" },
      },
      grid: { vertLines: { visible: false }, horzLines: { color: "#1c1c1f" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    // Indikator dihitung dari seluruh data lalu dipotong, supaya MA200 tetap benar di rentang pendek.
    const tutup = harga.map((x) => x.c);
    const dari = Math.max(0, harga.length - hari);
    const potong = <T,>(a: T[]) => a.slice(dari);
    const tampil = potong(harga);

    const candle = chart.addSeries(
      CandlestickSeries,
      {
        // Naik = batang kosong, turun = batang penuh: tidak hanya dibedakan dengan warna.
        upColor: "rgba(74,222,128,0)",
        downColor: "#ef4444",
        borderUpColor: "#4ade80",
        borderDownColor: "#ef4444",
        wickUpColor: "#4ade80",
        wickDownColor: "#ef4444",
        priceFormat: { type: "price", precision: 0, minMove: 1 },
      },
      0,
    );
    candle.setData(tampil.map((d) => ({ time: d.t as Time, open: d.o, high: d.h, low: d.l, close: d.c })));

    for (const o of OVERLAY) {
      if (!ma[o.id]) continue;
      const s = chart.addSeries(
        LineSeries,
        { color: o.warna, lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: o.label },
        0,
      );
      s.setData(garis(potong(sma(tutup, o.n)), tampil));
    }

    if (panel.volume) {
      const vol = chart.addSeries(
        HistogramSeries,
        { priceFormat: { type: "volume" }, priceScaleId: "vol", priceLineVisible: false, lastValueVisible: false },
        0,
      );
      chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      vol.setData(
        tampil.map((d) => ({
          time: d.t as Time,
          value: d.v,
          color: d.c >= d.o ? "rgba(74,222,128,0.35)" : "rgba(239,68,68,0.45)",
        })),
      );
    }

    let nomorPane = 1;
    if (panel.rsi) {
      const s = chart.addSeries(
        LineSeries,
        { color: "#ffffff", lineWidth: 1, title: "RSI 14", priceFormat: { type: "price", precision: 1, minMove: 0.1 } },
        nomorPane++,
      );
      s.setData(garis(potong(rsi(tutup, 14)), tampil));
      s.createPriceLine({ price: 70, color: "#52525b", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
      s.createPriceLine({ price: 30, color: "#52525b", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
    }
    if (panel.macd) {
      const m = macd(tutup);
      const h = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false }, nomorPane);
      h.setData(
        potong(m.hist).flatMap((v, i) =>
          v === null ? [] : [{ time: tampil[i].t as Time, value: v, color: v >= 0 ? "rgba(74,222,128,0.5)" : "rgba(239,68,68,0.55)" }],
        ),
      );
      const g = chart.addSeries(LineSeries, { color: "#38bdf8", lineWidth: 1, title: "MACD", priceLineVisible: false }, nomorPane);
      g.setData(garis(potong(m.macd), tampil));
      const sg = chart.addSeries(LineSeries, { color: "#eab308", lineWidth: 1, title: "Sinyal", priceLineVisible: false }, nomorPane);
      sg.setData(garis(potong(m.sinyal), tampil));
    }

    chart.panes()[0]?.setStretchFactor(3);
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [harga, rentang, ma, panel]);

  const tinggi = 360 + (panel.rsi ? 130 : 0) + (panel.macd ? 130 : 0);
  const akhir = harga[harga.length - 1];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div role="group" aria-label="Rentang waktu grafik" className="flex gap-2">
          {RENTANG.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={rentang === r.id}
              onClick={() => setRentang(r.id)}
              className={`chip cursor-pointer ${rentang === r.id ? "chip-aktif" : ""}`}
            >
              {r.id}
            </button>
          ))}
        </div>
        <fieldset className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <legend className="sr-only-x">Overlay dan panel indikator</legend>
          {OVERLAY.map((o) => (
            <label key={o.id} className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="size-[18px] accent-white"
                checked={ma[o.id]}
                onChange={(e) => setMa((p) => ({ ...p, [o.id]: e.target.checked }))}
              />
              <span style={{ color: o.warna }}>{o.label}</span>
            </label>
          ))}
          {(["volume", "rsi", "macd"] as Panel[]).map((p) => (
            <label key={p} className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="size-[18px] accent-white"
                checked={panel[p]}
                onChange={(e) => setPanel((x) => ({ ...x, [p]: e.target.checked }))}
              />
              {p === "volume" ? "Volume" : p.toUpperCase()}
            </label>
          ))}
        </fieldset>
      </div>
      <div
        ref={wadah}
        role="img"
        aria-label={`Grafik candlestick ${kode}, harga penutupan terakhir Rp ${Math.round(akhir?.c ?? 0)}`}
        style={{ height: tinggi }}
        className="w-full"
      />
      <p className="mt-2 text-xs text-teks-2">
        Batang kosong = harga tutup lebih tinggi dari buka; batang penuh = lebih rendah.
      </p>
    </div>
  );
}

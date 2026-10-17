"use client";

import { AreaSeries, ColorType, createChart, type Time } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import type { Candle } from "@/lib/types";

const RENTANG = [
  { id: "1B", label: "1B", hari: 21 },
  { id: "3B", label: "3B", hari: 63 },
  { id: "1T", label: "1T", hari: 260 },
] as const;

export default function GrafikGaris({ kode, harga }: { kode: string; harga: Candle[] }) {
  const wadah = useRef<HTMLDivElement>(null);
  const [rentang, setRentang] = useState<(typeof RENTANG)[number]["id"]>("3B");

  useEffect(() => {
    if (!wadah.current) return;
    const hari = RENTANG.find((r) => r.id === rentang)!.hari;
    const data = harga.slice(-hari);
    const naik = data.length > 1 && data[data.length - 1].c >= data[0].c;
    const warna = naik ? "#4ade80" : "#f87171";

    const chart = createChart(wadah.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa",
        fontFamily: "var(--font-jbmono), ui-monospace, monospace",
      },
      grid: { vertLines: { visible: false }, horzLines: { color: "#1c1c1f" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      handleScroll: false,
      handleScale: false,
      crosshair: { horzLine: { visible: false, labelVisible: false } },
    });
    const seri = chart.addSeries(AreaSeries, {
      lineColor: warna,
      topColor: naik ? "rgba(74,222,128,0.22)" : "rgba(248,113,113,0.22)",
      bottomColor: "rgba(5,5,5,0)",
      lineWidth: 2,
      priceFormat: { type: "price", precision: 0, minMove: 1 },
    });
    seri.setData(data.map((d) => ({ time: d.t as Time, value: d.c })));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [harga, rentang]);

  const awal = harga.slice(-RENTANG.find((r) => r.id === rentang)!.hari)[0];
  const akhir = harga[harga.length - 1];

  return (
    <div>
      <div role="group" aria-label="Rentang waktu grafik" className="mb-3 flex gap-2">
        {RENTANG.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={rentang === r.id}
            onClick={() => setRentang(r.id)}
            className={`chip cursor-pointer ${rentang === r.id ? "chip-aktif" : ""}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div
        ref={wadah}
        role="img"
        aria-label={`Grafik garis harga penutupan ${kode}, dari Rp ${Math.round(awal?.c ?? 0)} ke Rp ${Math.round(akhir?.c ?? 0)}`}
        className="h-[280px] w-full sm:h-[340px]"
      />
    </div>
  );
}

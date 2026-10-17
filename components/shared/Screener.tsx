"use client";

import { PresetScreener } from "@/components/pemula/PresetScreener";
import { ScreenerBebas } from "@/components/pro/ScreenerBebas";
import type { RingkasSaham } from "@/lib/data";
import { useMode } from "@/lib/mode";

export function Screener({ data, sektor }: { data: RingkasSaham[]; sektor: string[] }) {
  const mode = useMode();
  return mode === "pro" ? <ScreenerBebas data={data} sektor={sektor} /> : <PresetScreener data={data} />;
}

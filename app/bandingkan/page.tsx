import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/shared/KepalaHalaman";
import { Suspense } from "react";
import { Bandingkan } from "@/components/shared/Bandingkan";
import { semuaRingkas } from "@/lib/data";

export const metadata: Metadata = {
  title: "Bandingkan saham",
  description: "Bandingkan dua sampai tiga saham IDX berdampingan: valuasi, profitabilitas, dividen, dan kondisi teknikal.",
};

export default function HalamanBandingkan() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <KepalaHalaman nomor="09" label="Bandingkan" judul="Bandingkan saham">
        <p className="teks-pengantar">Pilih 2–3 saham, idealnya satu sektor.</p>
      </KepalaHalaman>
      <Suspense fallback={<p className="text-teks-2">Memuat…</p>}>
        <Bandingkan data={semuaRingkas()} />
      </Suspense>
    </div>
  );
}

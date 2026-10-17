import type { MetadataRoute } from "next";
import { semuaSaham, tanggalAcuan } from "@/lib/data";
import { GLOSARIUM } from "@/lib/glosarium";
import { URL_SITUS } from "@/lib/konten";

export default function sitemap(): MetadataRoute.Sitemap {
  const diubah = new Date(`${tanggalAcuan()}T00:00:00Z`);
  const statis = ["", "/saham", "/screener", "/dividen", "/kalkulator", "/belajar", "/bandingkan", "/tentang"];
  return [
    ...statis.map((p) => ({ url: `${URL_SITUS}${p}`, lastModified: diubah, changeFrequency: "daily" as const })),
    ...semuaSaham().map((s) => ({ url: `${URL_SITUS}/saham/${s.kode}`, lastModified: diubah, changeFrequency: "daily" as const })),
    ...GLOSARIUM.map((g) => ({ url: `${URL_SITUS}/belajar/${g.slug}`, changeFrequency: "monthly" as const })),
  ];
}

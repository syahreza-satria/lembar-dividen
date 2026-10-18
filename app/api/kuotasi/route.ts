import { connection } from "next/server";
import { semuaSaham } from "@/lib/data";
import { ambilKuotasi } from "@/lib/sumber-data/kuotasi";

/**
 * Kuotasi near-real-time untuk semua saham yang dicakup + IHSG + kurs USD/IDR.
 * Daftar simbol ditentukan server (bukan dari query) agar endpoint tidak bisa dipakai sebagai proxy bebas.
 */
export async function GET() {
  await connection();
  try {
    const hasil = await ambilKuotasi(semuaSaham().map((s) => s.kode));
    return Response.json(hasil, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45" },
    });
  } catch (e) {
    return Response.json({ galat: (e as Error).message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

const idAngka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export const TIDAK_ADA = "n/a";

export function angka(x: number | null | undefined, desimal = 0): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return TIDAK_ADA;
  return x.toLocaleString("id-ID", { minimumFractionDigits: desimal, maximumFractionDigits: desimal });
}

export function rupiah(x: number | null | undefined, desimal = 0): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return TIDAK_ADA;
  return `Rp ${angka(x, desimal)}`;
}

/** "+2,1%" / "−0,8%" — tanda selalu eksplisit supaya tidak bergantung pada warna. */
export function persenBertanda(x: number | null | undefined, desimal = 2): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return TIDAK_ADA;
  const tanda = x > 0 ? "+" : x < 0 ? "−" : "";
  return `${tanda}${angka(Math.abs(x), desimal)}%`;
}

export function persen(x: number | null | undefined, desimal = 1): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return TIDAK_ADA;
  return `${angka(x, desimal)}%`;
}

export function kali(x: number | null | undefined, desimal = 1): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return TIDAK_ADA;
  return `${angka(x, desimal)}x`;
}

export function ringkasBesar(x: number | null | undefined): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return TIDAK_ADA;
  const a = Math.abs(x);
  if (a >= 1e12) return `${angka(x / 1e12, 2)} T`;
  if (a >= 1e9) return `${angka(x / 1e9, 2)} M`;
  if (a >= 1e6) return `${angka(x / 1e6, 2)} jt`;
  if (a >= 1e3) return `${angka(x / 1e3, 1)} rb`;
  return idAngka.format(x);
}

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const BULAN_PENUH = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-10-16" → "16 Okt 2026" (tanpa objek Date lokal, aman untuk prerender). */
export function tanggal(iso: string | null | undefined): string {
  if (!iso) return TIDAK_ADA;
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
}

export function namaBulan(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${BULAN_PENUH[m - 1]} ${y}`;
}

/** Tanggal & jam WIB dari ISO UTC. */
export function waktuWib(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 7 * 3600 * 1000);
  const j = d.toISOString();
  return `${tanggal(j.slice(0, 10))}, ${j.slice(11, 16).replace(":", ".")} WIB`;
}

/** Hari bursa (Senin–Jumat) sebelum tanggal ISO. Perkiraan: tidak memperhitungkan libur nasional. */
export function hariKerjaSebelum(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  do d.setUTCDate(d.getUTCDate() - 1);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return d.toISOString().slice(0, 10);
}

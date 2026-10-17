import { persenBertanda, TIDAK_ADA } from "@/lib/format";
import { PanahNaik, PanahTurun, Strip } from "./ikon";

/**
 * Naik/turun selalu dibedakan dengan tanda +/− dan ikon panah, bukan hanya warna (WCAG).
 */
export function Perubahan({ nilai, desimal = 2, className = "" }: { nilai: number | null; desimal?: number; className?: string }) {
  if (nilai === null || !Number.isFinite(nilai)) return <span className={`angka text-teks-2 ${className}`}>{TIDAK_ADA}</span>;
  const arah = nilai > 0 ? "naik" : nilai < 0 ? "turun" : "datar";
  const warna = arah === "naik" ? "text-naik" : arah === "turun" ? "text-turun" : "text-teks-2";
  const Ikon = arah === "naik" ? PanahNaik : arah === "turun" ? PanahTurun : Strip;
  return (
    <span className={`angka inline-flex items-center gap-1 whitespace-nowrap ${warna} ${className}`}>
      <Ikon width={14} height={14} />
      <span className="sr-only-x">{arah}</span>
      {persenBertanda(nilai, desimal)}
    </span>
  );
}

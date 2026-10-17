import { KONDISI, type KunciKondisi } from "@/lib/kondisi";
import { Istilah } from "./Istilah";

const WARNA: Partial<Record<KunciKondisi, string>> = {
  golden_cross: "chip-sukses",
  macd_naik: "chip-sukses",
  death_cross: "chip-galat",
  macd_turun: "chip-galat",
  rsi_rendah: "chip-peringatan",
  rsi_tinggi: "chip-peringatan",
};

/** Penanda deskriptif; sengaja tanpa label beli/jual. */
export function KondisiTeknikal({ kondisi }: { kondisi: KunciKondisi[] }) {
  if (!kondisi.length) {
    return <p className="text-sm text-teks-2">Tidak ada kondisi khusus.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {kondisi.map((k) => (
        <li key={k} title={KONDISI[k].deskripsi}>
          <span className={`chip ${WARNA[k] ?? ""}`}>
            <Istilah k={KONDISI[k].istilah}>{KONDISI[k].label}</Istilah>
          </span>
        </li>
      ))}
    </ul>
  );
}

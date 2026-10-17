import { Istilah } from "@/components/shared/Istilah";
import type { KartuAngka } from "@/lib/penjelasan";

const NAMA: Record<KartuAngka["kunci"], string> = {
  per: "PER",
  pbv: "PBV",
  roe: "ROE",
  der: "DER",
  dy: "Dividend yield",
};

export function KartuFundamental({ kartu }: { kartu: KartuAngka[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {kartu.map((k) => (
        <li key={k.kunci} className="kartu p-4">
          <p className="text-sm font-medium text-teks-2">
            <Istilah k={k.istilah}>{NAMA[k.kunci]}</Istilah>
          </p>
          <p className="angka mt-1 text-2xl font-semibold">{k.nilai}</p>
          <p className="mt-2 text-sm text-teks-2">{k.penjelasan}</p>
        </li>
      ))}
    </ul>
  );
}

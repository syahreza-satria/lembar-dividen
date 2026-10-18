import type { Candle, Dividen, Fundamental } from "../types";

export type HasilEmiten = {
  harga: Candle[];
  dividen: Dividen[];
  /** null bila penyedia tidak menyediakan fundamental */
  fundamental: Fundamental | null;
};

/** Kontrak adapter: ganti penyedia data cukup dengan mengimplementasikan ini. */
export interface SumberData {
  nama: string;
  ambilEmiten(kode: string): Promise<HasilEmiten>;
  ambilIndeks(): Promise<Candle[]>;
  /** kurs USD/IDR */
  ambilKurs(): Promise<Candle[]>;
}

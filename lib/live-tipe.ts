/** Kuotasi satu instrumen. */
export type Kuotasi = {
  /** harga terakhir */
  h: number;
  /** perubahan absolut terhadap penutupan sebelumnya */
  u: number | null;
  /** perubahan persen */
  p: number | null;
  /** volume hari ini */
  v: number;
  /** waktu kuotasi, epoch detik */
  t: number;
};

export type RespLive = {
  /** waktu server mengambil data, epoch milidetik */
  waktu: number;
  /** status pasar IHSG dari sumber: REGULAR, PRE, POST, CLOSED, dst. */
  status: string;
  /** penundaan data dari bursa dalam menit, bila dilaporkan sumber */
  tundaMenit: number | null;
  kuotasi: Record<string, Kuotasi>;
};

export const KUNCI_IHSG = "IHSG";
export const KUNCI_KURS = "USDIDR";

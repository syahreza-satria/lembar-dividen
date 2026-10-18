/** Garis mini yang dirender di server (SVG), tanpa JavaScript. */
export function Sparkline({
  data,
  lebar = 320,
  tinggi = 96,
  label,
  terang = false,
}: {
  data: number[];
  lebar?: number;
  tinggi?: number;
  label: string;
  /** dipakai di atas kartu terang: warna lebih gelap agar kontras */
  terang?: boolean;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const maks = Math.max(...data);
  const rentang = maks - min || 1;
  const pad = 4;
  const titik = data.map((v, i) => {
    const x = (i / (data.length - 1)) * lebar;
    const y = pad + (1 - (v - min) / rentang) * (tinggi - pad * 2);
    return [x, y] as const;
  });
  const garis = titik.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${garis} L${lebar} ${tinggi} L0 ${tinggi} Z`;
  const naik = data[data.length - 1] >= data[0];
  const warna = terang ? (naik ? "#15803d" : "#b91c1c") : naik ? "#4ade80" : "#f87171";
  return (
    <svg viewBox={`0 0 ${lebar} ${tinggi}`} role="img" aria-label={label} preserveAspectRatio="none" style={{ height: tinggi }} className="w-full">
      <path d={area} fill={warna} opacity="0.12" />
      <path d={garis} fill="none" stroke={warna} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const dasar = (p: P): P => ({
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...p,
});

export const PanahNaik = (p: P) => (
  <svg {...dasar(p)}>
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

export const PanahTurun = (p: P) => (
  <svg {...dasar(p)}>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

export const Strip = (p: P) => (
  <svg {...dasar(p)}>
    <path d="M5 12h14" />
  </svg>
);

export const Cari = (p: P) => (
  <svg {...dasar(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Bintang = ({ isi, ...p }: P & { isi?: boolean }) => (
  <svg {...dasar({ ...p, fill: isi ? "currentColor" : "none" })}>
    <path d="m12 2.5 2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5Z" />
  </svg>
);

export const Info = (p: P) => (
  <svg {...dasar(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const Buku = (p: P) => (
  <svg {...dasar(p)}>
    <path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2.5Z" />
    <path d="M4 19.5A2 2 0 0 1 6 17.5h13" />
  </svg>
);

export const Unduh = (p: P) => (
  <svg {...dasar(p)}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

export const Hapus = (p: P) => (
  <svg {...dasar(p)}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

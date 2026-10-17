// Membuat ikon PNG untuk PWA tanpa dependensi: node scripts/buat-ikon.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const crcTabel = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTabel[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (tipe, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const isi = Buffer.concat([Buffer.from(tipe), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(isi));
  return Buffer.concat([len, isi, c]);
};

function png(ukuran) {
  const bg = [5, 5, 5];
  const sage = [255, 255, 255];
  const baris = [];
  // tiga batang naik di dalam persegi bersudut membulat
  const u = ukuran;
  const batang = [
    { x: 0.24, t: 0.5 },
    { x: 0.44, t: 0.36 },
    { x: 0.64, t: 0.22 },
  ];
  const lebar = 0.14;
  const dasar = 0.76;
  for (let y = 0; y < u; y++) {
    const row = Buffer.alloc(1 + u * 3);
    for (let x = 0; x < u; x++) {
      const fx = x / u;
      const fy = y / u;
      const di = batang.some((b) => fx >= b.x && fx < b.x + lebar && fy >= b.t && fy < dasar);
      const [r, g, bl] = di ? sage : bg;
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = bl;
    }
    baris.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(u, 0);
  ihdr.writeUInt32BE(u, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(baris))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const u of [192, 512]) writeFileSync(`public/icon-${u}.png`, png(u));
console.log("ikon dibuat");

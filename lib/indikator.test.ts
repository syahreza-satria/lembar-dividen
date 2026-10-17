import { test } from "node:test";
import assert from "node:assert/strict";
import { ema, macd, memotongKeAtas, rsi, sma } from "./indikator";

const dekat = (a: number | null, b: number, eps = 1e-6) => {
  assert.ok(a !== null && Math.abs(a - b) < eps, `${a} != ${b}`);
};

test("sma menghitung rata-rata bergulir", () => {
  const h = sma([1, 2, 3, 4, 5], 3);
  assert.deepEqual(h, [null, null, 2, 3, 4]);
});

test("ema dimulai dari sma periode pertama", () => {
  const h = ema([1, 2, 3, 4, 5], 3);
  dekat(h[2], 2);
  dekat(h[3], 3);
  dekat(h[4], 4);
});

test("rsi: harga naik terus = 100, turun terus = 0", () => {
  const naik = Array.from({ length: 30 }, (_, i) => 100 + i);
  const turun = Array.from({ length: 30 }, (_, i) => 100 - i);
  dekat(rsi(naik).at(-1) ?? null, 100);
  dekat(rsi(turun).at(-1) ?? null, 0);
});

test("rsi: contoh klasik Wilder", () => {
  const c = [
    44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28,
    46.0, 46.03, 46.41, 46.22, 45.64,
  ];
  const h = rsi(c, 14);
  dekat(h[14], 70.46, 0.1);
  dekat(h[15], 66.25, 0.1);
});

test("macd: seri konstan menghasilkan nol", () => {
  const m = macd(new Array(60).fill(10));
  dekat(m.macd.at(-1) ?? null, 0);
  dekat(m.sinyal.at(-1) ?? null, 0);
  dekat(m.hist.at(-1) ?? null, 0);
});

test("macd: garis = ema12 - ema26", () => {
  const x = Array.from({ length: 80 }, (_, i) => 100 + Math.sin(i / 5) * 10 + i * 0.2);
  const m = macd(x);
  const e12 = ema(x, 12);
  const e26 = ema(x, 26);
  dekat(m.macd[70], (e12[70] as number) - (e26[70] as number));
  assert.equal(m.macd[24], null);
});

test("memotongKeAtas hanya pada bar terakhir", () => {
  assert.equal(memotongKeAtas([1, 1, 3], [2, 2, 2]), true);
  assert.equal(memotongKeAtas([3, 3, 3], [2, 2, 2]), false);
  assert.equal(memotongKeAtas([1, null, 3], [2, 2, 2]), false);
});

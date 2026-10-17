import Link from "next/link";
import { Suspense } from "react";
import { semuaRingkas } from "@/lib/data";
import { CariSaham } from "./CariSaham";
import { NavUtama } from "./NavUtama";
import { ToggleMode } from "./ToggleMode";

export function Header() {
  const daftar = semuaRingkas().map((s) => ({ kode: s.kode, nama: s.nama, sektor: s.sektor }));
  return (
    <header className="situs sticky top-0 z-30 border-b border-garis bg-bg/80 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8 lg:flex-nowrap lg:px-12">
        <Link href="/" data-masuk className="order-1 flex shrink-0 items-baseline gap-2">
          <span className="text-[17px] font-semibold uppercase tracking-[0.04em]">Lembar Dividen</span>
          <span className="label-mono !text-[10px]">IDX</span>
        </Link>
        <div data-masuk className="order-4 w-full min-w-0 lg:order-2 lg:w-auto lg:flex-1">
          <Suspense fallback={<div className="h-9" />}>
            <NavUtama />
          </Suspense>
        </div>
        <div data-masuk className="order-3 w-full lg:order-3 lg:w-64">
          <CariSaham daftar={daftar} />
        </div>
        <div data-masuk className="order-2 ml-auto lg:order-4 lg:ml-0">
          <ToggleMode />
        </div>
      </div>
    </header>
  );
}

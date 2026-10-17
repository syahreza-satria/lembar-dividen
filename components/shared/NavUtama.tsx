"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/", label: "Beranda" },
  { href: "/saham", label: "Saham" },
  { href: "/screener", label: "Screener" },
  { href: "/dividen", label: "Dividen" },
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/belajar", label: "Belajar" },
  { href: "/watchlist", label: "Watchlist" },
];

export function NavUtama() {
  const path = usePathname();
  return (
    <nav aria-label="Navigasi utama" className="-mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
      <ul className="flex min-w-max gap-1">
        {MENU.map((m) => {
          const aktif = m.href === "/" ? path === "/" : path === m.href || path.startsWith(`${m.href}/`);
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={aktif ? "page" : undefined}
                className={`label-mono block rounded-full px-3.5 py-2 ${
                  aktif ? "!bg-white !text-[#050505]" : "gh-nav"
                }`}
              >
                {m.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

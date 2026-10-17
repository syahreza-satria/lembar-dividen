import Link from "next/link";
import { infoPembaruan, tanggalAcuan } from "@/lib/data";
import { tanggal, waktuWib } from "@/lib/format";
import { DISCLAIMER } from "@/lib/konten";

export function Footer() {
  const info = infoPembaruan();
  return (
    <footer className="border-t border-garis">
      <div className="grid gap-10 px-5 py-14 text-sm text-teks-2 sm:px-8 lg:grid-cols-[2fr_1fr_1fr] lg:px-12 lg:py-20">
        <div className="space-y-4">
          <p className="label-mono">Disclaimer</p>
          <p className="max-w-prose text-base text-teks">{DISCLAIMER}</p>
        </div>
        <div className="space-y-4">
          <p className="label-mono">Data</p>
          <p>
            Harga tutup <span className="text-teks">{tanggal(tanggalAcuan())}</span>
            <br />
            Diperbarui {waktuWib(info.diperbarui)}
          </p>
          <p>Sumber: {info.sumber}</p>
        </div>
        <div className="space-y-4">
          <p className="label-mono">Situs</p>
          <ul className="space-y-1.5">
            {[
              ["/tentang", "Metode dan sumber data"],
              ["/belajar", "Glosarium"],
              ["/dividen", "Kalender dividen"],
              ["/kalkulator", "Kalkulator"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="gh-teks">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-garis px-5 py-5 sm:px-8 lg:px-12">
        <p className="label-mono !text-[10px]">Lembar Dividen // Alat edukasi, bukan penasihat investasi</p>
      </div>
    </footer>
  );
}

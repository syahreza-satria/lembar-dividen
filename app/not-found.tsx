import Link from "next/link";

export default function TidakDitemukan() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="label-mono">404 // Not found</p>
      <h1 className="mt-2 judul-halaman">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-teks-2">Coba kolom pencarian di atas.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/saham" className="tombol tombol-utama">Daftar saham</Link>
        <Link href="/belajar" className="tombol tombol-sekunder">Glosarium</Link>
      </div>
    </div>
  );
}

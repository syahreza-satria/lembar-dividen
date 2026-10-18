import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cariIstilah, GLOSARIUM } from "@/lib/glosarium";

export function generateStaticParams() {
  return GLOSARIUM.map((g) => ({ istilah: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/belajar/[istilah]">): Promise<Metadata> {
  const { istilah } = await params;
  const g = cariIstilah(istilah);
  if (!g) return {};
  const judul = `Apa itu ${g.istilah}?`;
  return {
    title: judul,
    description: g.ringkas,
    alternates: { canonical: `/belajar/${g.slug}` },
    openGraph: { title: judul, description: g.ringkas, type: "article", locale: "id_ID" },
  };
}


function Kerangka() {
  return (
    <p className="label-mono" role="status">
      Memuat…
    </p>
  );
}

export default function HalamanIstilah({ params }: PageProps<"/belajar/[istilah]">) {
  return (
    <Suspense fallback={<Kerangka />}>
      <IsiIstilah params={params} />
    </Suspense>
  );
}

async function IsiIstilah({ params }: { params: Promise<{ istilah: string }> }) {
  const { istilah } = await params;
  const g = cariIstilah(istilah);
  if (!g) notFound();

  return (
    <article className="space-y-10 lg:space-y-14">
      <nav aria-label="Breadcrumb" className="label-mono" data-label>
        <Link href="/belajar" className="gh-teks hover:underline">Belajar</Link> <span aria-hidden>/</span> {g.istilah}
      </nav>
      <header data-kepala>
        <h1 className="judul-halaman"><span className="topeng"><span className="topeng-isi" data-reveal>Apa itu {g.istilah}?</span></span></h1>
        <p className="teks-pengantar mt-5 !text-teks">{g.ringkas}</p>
      </header>
      <div className="space-y-4 text-[17px] leading-relaxed text-teks">
        {g.penjelasan.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {g.rumus && (
        <section className="kartu p-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.5px] text-teks-2">Rumus</h2>
          <p className="angka mt-1 text-sm">{g.rumus}</p>
        </section>
      )}
      {g.contoh && (
        <section className="kartu p-4">
          <h2 className="text-xs font-medium uppercase tracking-[0.5px] text-teks-2">Contoh</h2>
          <p className="mt-1">{g.contoh}</p>
        </section>
      )}
      {g.terkait.length > 0 && (
        <section aria-labelledby="terkait">
          <h2 id="terkait" className="judul-seksi mb-3">Istilah terkait</h2>
          <ul className="flex flex-wrap gap-2">
            {g.terkait.map((t) => {
              const x = cariIstilah(t);
              return x ? (
                <li key={t}>
                  <Link href={`/belajar/${t}`} className="chip normal-case">{x.istilah}</Link>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}
      <p className="text-sm text-teks-2">Edukatif, bukan saran investasi.</p>
    </article>
  );
}

import { TeksIstilah } from "@/components/shared/TeksIstilah";

export function RingkasanSaham({ kalimat }: { kalimat: string[] }) {
  return (
    <section aria-labelledby="ringkasan" className="kartu-terang h-full p-6 lg:p-8">
      <h2 id="ringkasan" className="label-mono">
        Ringkasan // Bahasa sederhana
      </h2>
      <div className="mt-5 space-y-3 text-[17px] leading-relaxed">
        {kalimat.map((k, i) => (
          <p key={i}>
            <TeksIstilah teks={k} />
          </p>
        ))}
      </div>
      <p className="mt-6 border-t border-garis pt-4 text-sm text-teks-2">Dibuat otomatis dari data. Bukan saran beli atau jual.</p>
    </section>
  );
}

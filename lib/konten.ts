export const NAMA_SITUS = "Lembar Dividen";

export const DISCLAIMER =
  "Informasi edukatif, bukan ajakan membeli atau menjual efek. Data bisa tertunda atau keliru. Keputusan investasi tanggung jawab pengguna.";

export const URL_SITUS = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lembardividen.example";

/**
 * Dijalankan inline di <head> sebelum hydration: menetapkan mode (kunci sama dengan lib/mode.ts)
 * dan, bila gerak tidak dikurangi, menyalakan kelas `anim` yang menyembunyikan elemen masuk
 * sampai GSAP mengambil alih. Kelas dilepas otomatis setelah 2,5 detik sebagai pengaman bila JS gagal.
 */
export const SKRIP_MODE = `try{var d=document.documentElement,m=localStorage.getItem("ld-mode");d.dataset.mode=m==="pro"?"pro":"pemula"}catch(e){document.documentElement.dataset.mode="pemula"}try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("anim");setTimeout(function(){document.documentElement.classList.remove("anim")},2500)}}catch(e){}`;

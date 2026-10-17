import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lembar Dividen",
    short_name: "Lembar Dividen",
    description: "Baca saham IDX dengan bahasa sederhana, atau pakai candlestick dan screener di Mode Pro.",
    lang: "id",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}

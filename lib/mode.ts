"use client";

import { useSyncExternalStore } from "react";

export type Mode = "pemula" | "pro";

const KUNCI = "ld-mode";
export const PERISTIWA_MODE = "ld-mode-berubah";

function langganan(cb: () => void) {
  window.addEventListener(PERISTIWA_MODE, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(PERISTIWA_MODE, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useMode(): Mode {
  return useSyncExternalStore<Mode>(
    langganan,
    () => (document.documentElement.dataset.mode === "pro" ? "pro" : "pemula"),
    () => "pemula",
  );
}

export function setMode(m: Mode) {
  try {
    localStorage.setItem(KUNCI, m);
  } catch {
    /* penyimpanan diblokir: mode tetap berlaku untuk sesi ini */
  }
  document.documentElement.dataset.mode = m;
  window.dispatchEvent(new Event(PERISTIWA_MODE));
}

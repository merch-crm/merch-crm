/**
 * Ленивые импорты для тяжёлых библиотек
 * Загружаются только при первом использовании
 */

import dynamic from "next/dynamic";
import { type ComponentType } from "react";

/**
 * Fabric.js — загружается только в редакторе дизайна
 */
export async function getFabric() {
  const fabric = await import("fabric");
  return fabric;
}

/**
 * jsPDF — загружается только при генерации PDF
 */
export async function getJsPDF() {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  return { jsPDF, autoTable };
}

/**
 * Sharp — только на сервере для обработки изображений
 */
export async function getSharp() {
  if (typeof window !== "undefined") {
    throw new Error("Sharp можно использовать только на сервере");
  }
  const sharp = await import("sharp");
  return sharp.default;
}

/**
 * Recharts — загружается только на страницах аналитики
 */
export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart as ComponentType<Record<string, unknown>>),
  { ssr: false }
);

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart as ComponentType<Record<string, unknown>>),
  { ssr: false }
);

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart as ComponentType<Record<string, unknown>>),
  { ssr: false }
);

/**
 * QR-код сканер — только на странице сканирования
 */
export const LazyQRScanner = dynamic(
  () => import("html5-qrcode").then((_mod) => {
    // Возвращаем компонент-обёртку
    return function QRScannerWrapper(_props: { onScan: (data: string) => void }) {
      return null; // Заглушка, реальный компонент в коде
    };
  }),
  { ssr: false }
);


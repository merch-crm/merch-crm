"use client";

import { Palette, Image, Layers, Link2 } from "lucide-react";
import { ModernStatCard } from "@/components/ui/stat-card";

interface PrintsStats {
  collections: number;
  designs: number;
  versions: number;
  files: number;
  linkedLines: number;
}

interface PrintsWidgetsProps {
  stats: PrintsStats;
}

export function PrintsWidgets({ stats }: PrintsWidgetsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <ModernStatCard icon={Palette} value={stats.collections} label="Коллекций" colorScheme="purple" />
      <ModernStatCard icon={Image} value={stats.designs} label="Принтов" colorScheme="blue" />
      <ModernStatCard icon={Layers} value={stats.files} label="Файлов" colorScheme="emerald" />
      <ModernStatCard icon={Link2} value={stats.linkedLines} label="В линейках" subLabel="Используется" colorScheme="amber" />
    </div>
  );
}

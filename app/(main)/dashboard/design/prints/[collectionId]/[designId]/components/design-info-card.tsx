"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Image as ImageIcon, Calendar, Layout } from "lucide-react";
import { DesignWithMockups } from "@/lib/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface DesignInfoCardProps {
  design: DesignWithMockups;
}

export function DesignInfoCard({ design }: DesignInfoCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Info className="h-5 w-5 text-muted-foreground" />
          Основная информация
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Превью */}
          <div className="w-full md:w-1/3 aspect-square relative bg-muted border-r">
            {design.preview ? (
              <Image src={design.preview} alt={design.name} fill className="object-contain p-4" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                <span className="text-xs">Нет превью</span>
              </div>
            )}
          </div>

          {/* Данные */}
          <div className="flex-1 p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                  <Layout className="h-3 w-3" />
                  Коллекция
                </p>
                <p className="text-sm font-medium">
                  {design.collection?.name || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                  <Calendar className="h-3 w-3" />
                  Дата создания
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(design.createdAt), "d MMMM yyyy", { locale: ru })}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-muted-foreground font-semibold">
                  Описание
                </p>
                <p className="text-sm text-balance">
                  {design.description || (
                    <span className="text-muted-foreground italic">
                      Описание отсутствует
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Badge color={design.isActive ? "gray" : "purple"} className="rounded-md">
                {design.isActive ? "Активный дизайн" : "Дизайн в архиве"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

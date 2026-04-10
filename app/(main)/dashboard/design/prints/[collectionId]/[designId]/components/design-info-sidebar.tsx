"use client";

import { Tag, Eye, EyeOff, DollarSign, Calendar, Edit, Plus, Copy } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { ApplicationType } from "@/lib/schema/production";

interface DesignInfoSidebarProps {
  design: {
    id: string;
    isActive: boolean;
    costPrice: number | null | string;
    retailPrice: number | null | string;
    createdAt: Date | string;
    updatedAt: Date | string | null;
    applicationTypeId: string | null;
  };
  applicationType?: ApplicationType;
  onEdit: () => void;
  onAddMockup: () => void;
  onDuplicate: () => void;
}

export function DesignInfoSidebar({
  design,
  applicationType,
  onEdit,
  onAddMockup,
  onDuplicate
}: DesignInfoSidebarProps) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Application Type */}
          {applicationType && (
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Тип нанесения</p>
                <div className="flex items-center gap-2">
                  {applicationType.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: applicationType.color }}
                    />
                  )}
                  <span className="text-sm font-medium">
                    {applicationType.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3">
            {design.isActive ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">Статус</p>
              <p className="text-sm font-medium">
                {design.isActive ? "Активен" : "Неактивен"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Prices */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Себестоимость</p>
                <p className="text-sm font-medium">
                  {design.costPrice
                    ? `${design.costPrice} ₽`
                    : "Не указана"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Розничная цена
                </p>
                <p className="text-sm font-medium">
                  {design.retailPrice
                    ? `${design.retailPrice} ₽`
                    : "Не указана"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Создан</p>
              <p className="text-sm font-medium">
                {format(new Date(design.createdAt), "dd MMMM yyyy", {
                  locale: ru,
                })}
              </p>
            </div>
          </div>

          {design.updatedAt && design.updatedAt !== design.createdAt && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Обновлён</p>
                <p className="text-sm font-medium">
                  {format(new Date(design.updatedAt), "dd MMMM yyyy", {
                    locale: ru,
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={onAddMockup}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить мокап
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Дублировать
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

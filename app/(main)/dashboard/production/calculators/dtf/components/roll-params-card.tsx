"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, type SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  type CalculatorParams,
  ROLL_WIDTH_OPTIONS,
} from "../../types";

interface RollParamsCardProps {
  params: CalculatorParams;
  onChange: (updates: Partial<CalculatorParams>) => void;
}

export function RollParamsCard({ params, onChange }: RollParamsCardProps) {
  // Опции для Select
  const rollWidthSelectOptions: SelectOption[] = ROLL_WIDTH_OPTIONS[params.applicationType].map(
    (opt) => ({
      id: String(opt.value),
      title: opt.label,
      description: opt.description,
    })
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Параметры печати</h2>
          <Badge color="neutral">
            Рулон {params.rollWidthMm} мм
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ширина рулона */}
          <Select label="Ширина рулона" options={rollWidthSelectOptions} value={String(params.rollWidthMm)} onChange={(value) => onChange({ rollWidthMm: parseInt(value, 10) })}
          />

          {/* Отступ от края */}
          <div className="space-y-1.5">
            <Label className="ml-1">Отступ от края (мм)</Label>
            <Input type="number" value={params.edgeMarginMm} onChange={(e) =>
                onChange({ edgeMarginMm: parseInt(e.target.value, 10) || 0 })
              }
              min={0}
              max={50}
            />
          </div>

          {/* Отступ между принтами */}
          <div className="space-y-1.5">
            <Label className="ml-1">Между принтами (мм)</Label>
            <Input type="number" value={params.printGapMm} onChange={(e) =>
                onChange({ printGapMm: parseInt(e.target.value, 10) || 0 })
              }
              min={0}
              max={50}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

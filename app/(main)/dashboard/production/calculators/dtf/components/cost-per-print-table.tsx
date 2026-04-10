"use client";

import { memo, useState } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { CalculatedSection } from "../../types";

interface CostPerPrintTableProps {
  sections: CalculatedSection[];
  className?: string;
}

type SortField = "name" | "quantity" | "costPerPrint" | "sectionCost";
type SortDirection = "asc" | "desc";

export const CostPerPrintTable = memo(function CostPerPrintTable({
  sections,
  className,
}: CostPerPrintTableProps) {
  const [sortField, setSortField] = useState<SortField>("name" as SortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Сортировка
  const sortedSections = [...sections].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "quantity":
        comparison = a.quantity - b.quantity;
        break;
      case "costPerPrint":
        comparison = a.costPerPrint - b.costPerPrint;
        break;
      case "sectionCost":
        comparison = a.sectionCost - b.sectionCost;
        break;
      default:
        comparison = 0;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleExpanded = (groupId: string) => {
    setExpanded((prev) => (prev === groupId ? null : groupId));
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Себестоимость по принтам</h3>
          <div className="flex items-center gap-1">
            <SortButton label="Кол-во" field="quantity" currentField={sortField} direction={sortDirection} onClick={() => handleSort("quantity")}
            />
            <SortButton label="Цена" field="costPerPrint" currentField={sortField} direction={sortDirection} onClick={() => handleSort("costPerPrint")}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedSections.map((section) => (
            <SectionRow key={section.groupId} section={section} isExpanded={expanded === section.groupId} onToggle={() => toggleExpanded(section.groupId)}
            />
          ))}
        </div>

        {/* Итого */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold">Итого</span>
            <div className="text-right">
              <span className="font-bold text-lg">
                {formatCurrency(sections.reduce((sum, s) => sum + s.sectionCost, 0))}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                ({sections.reduce((sum, s) => sum + s.quantity, 0)} шт)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Кнопка сортировки
interface SortButtonProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onClick: () => void;
}

function SortButton({ label, field, currentField, direction, onClick }: SortButtonProps) {
  const isActive = currentField === field;

  return (
    <Button variant="ghost" size="sm" onClick={onClick} className={cn( "h-7 px-2 text-xs", isActive && "bg-slate-100 text-primary" )}>
      {label}
      {isActive ? (
        direction === "asc" ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
      )}
    </Button>
  );
}

// Строка секции
interface SectionRowProps {
  section: CalculatedSection;
  isExpanded: boolean;
  onToggle: () => void;
}

function SectionRow({ section, isExpanded, onToggle }: SectionRowProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 overflow-hidden transition-all",
        isExpanded ? "bg-white shadow-sm" : "bg-slate-50 hover:bg-slate-100"
      )}
    >
      {/* Main Row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-md shrink-0"
            style={{ backgroundColor: section.color }}
          />
          <div>
            <p className="font-bold text-sm">{section.name}</p>
            <p className="text-xs text-muted-foreground">
              {section.widthMm}×{section.heightMm} мм • {section.quantity} шт
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-sm">
              {formatCurrency(section.costPerPrint)}
              <span className="text-xs font-normal text-muted-foreground"> / шт</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(section.sectionCost)}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <DetailItem label="Раскладка" value={`${section.printsPerRow} × ${section.rowsCount}`} />
            <DetailItem label="Длина секции" value={`${(section.sectionLengthMm / 1000).toFixed(3)} м`} />
            <DetailItem label="Площадь" value={`${section.sectionAreaM2.toFixed(4)} м²`} />
            <DetailItem label="Нанесение" value={section.placementCost> 0 ? formatCurrency(section.placementCost) : "—"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Элемент детализации
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

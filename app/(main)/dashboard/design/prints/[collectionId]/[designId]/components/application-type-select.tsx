"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

import { getApplicationTypes } from "@/app/(main)/dashboard/production/actions/application-type-actions";

interface ApplicationTypeSelectProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

type ApplicationType = {
  id: string;
  name: string;
  slug: string;
  category: string;
  color: string | null;
  isActive: boolean;
};

const categoryLabels: Record<string, string> = {
  print: "Печать",
  embroidery: "Вышивка",
  engraving: "Гравировка",
  transfer: "Термоперенос",
  other: "Прочее",
};

export function ApplicationTypeSelect({
  value,
  onChange,
  disabled,
}: ApplicationTypeSelectProps) {
  const [types, setTypes] = useState<ApplicationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTypes() {
      const result = await getApplicationTypes({ activeOnly: true });
      if (result.success && result.data) {
        setTypes(result.data as ApplicationType[]);
      }
      setIsLoading(false);
    }
    loadTypes();
  }, []);

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full justify-start">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Загрузка...
      </Button>
    );
  }

  const options = types.map((type) => ({
    id: type.id,
    title: type.name,
    description: type.slug,
    color: type.color || "#6B7280",
    badge: categoryLabels[type.category],
  }));

  return (
    <Select options={options} value={value || ""} onChange={(val) => onChange(val || null)}
      disabled={disabled}
      clearable
      placeholder="Выберите тип нанесения..."
      showSearch
    />
  );
}

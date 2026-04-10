"use client";

import { FormInput } from "@/components/ui/form-input";
import { Select } from "@/components/ui/select";
import { DuplicateWarningBanner, DuplicateClient } from "../../components/duplicate-warning-banner";
import { AnimatePresence } from "framer-motion";
import { NewClientFormData } from "../new-client.types";

interface Step2Props {
  formData: NewClientFormData;
  updateFormData: (updates: Partial<NewClientFormData>) => void;
  managers: { id: string; name: string }[];
  sources: { id: string; title: string }[];
  duplicates: DuplicateClient[];
  hasDuplicates: boolean;
  handleOpenClient: (id: string) => void;
  dismissDuplicates: () => void;
}

export function Step2Additional({
  formData,
  updateFormData,
  managers,
  sources,
  duplicates,
  hasDuplicates,
  handleOpenClient,
  dismissDuplicates
}: Step2Props) {
  return (
    <div className="max-w-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnimatePresence>
        {hasDuplicates && (
          <DuplicateWarningBanner duplicates={duplicates} onOpenClient={handleOpenClient} onDismiss={dismissDuplicates} />
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Менеджер</label>
          <Select value={formData.managerId} onChange={(val) => updateFormData({ managerId: val })}
            options={[
              { id: "", title: "Не назначен" },
              ...managers.map(m => ({ id: m.id, title: m.name }))
            ]}
            className="w-full"
            triggerClassName="h-12 bg-slate-50 border-slate-200 border-0"
          />
        </div>
        <FormInput label="Город" type="text" value={formData.city} onChange={(e) => updateFormData({ city: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Источник привлечения</label>
          <Select value={formData.acquisitionSource} onChange={(val) => updateFormData({ acquisitionSource: val })}
            options={sources}
            className="w-full"
            triggerClassName="h-12 bg-slate-50 border-slate-200 border-0"
          />
        </div>
        <FormInput label="Адрес" type="text" value={formData.address} onChange={(e) => updateFormData({ address: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="client-comments" className="text-sm font-bold text-slate-700 ml-1">Комментарии</label>
        <textarea
          id="client-comments"
          value={formData.comments}
          onChange={(e) => updateFormData({ comments: e.target.value })}
          rows={4}
          className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none resize-none"
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getManagers } from "./actions/core.actions";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { ClientTypeSwitch } from "./components/client-type-switch";
import { AnimatePresence } from "framer-motion";
import { DuplicateWarningBanner } from "./components/duplicate-warning-banner";

// Hooks
import { useClientForm } from "./hooks/use-client-form";

// Components
import { ClientFormFields } from "./components/client-form-fields";
import { SocialFields } from "./components/social-fields";

interface ClientData {
  id: string;
  lastName: string;
  firstName: string;
  patronymic?: string | null;
  company?: string | null;
  phone?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  comments?: string | null;
  socialLink?: string | null;
  acquisitionSource?: string | null;
  managerId?: string | null;
  clientType?: "b2c" | "b2b" | null;
}

interface EditClientDialogProps {
  client: ClientData;
  isOpen: boolean;
  onClose: () => void;
}

const ACQUISITION_SOURCES = [
  { id: "", title: "Не указан" },
  { id: "Instagram", title: "📸 Instagram" },
  { id: "Telegram", title: "✈️ Telegram" },
  { id: "WhatsApp", title: "💬 WhatsApp" },
  { id: "VK", title: "🔵 VK" },
  { id: "Сайт", title: "🌐 Сайт" },
  { id: "Рекомендация", title: "👥 Рекомендация" },
  { id: "Выставка", title: "🎪 Выставка" },
  { id: "Реклама", title: "📢 Реклама" },
  { id: "Другое", title: "📍 Другое" },
];

export function EditClientDialog({ client, isOpen, onClose }: EditClientDialogProps) {
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  
  const {
    form,
    setForm,
    loading,
    duplicates,
    hasDuplicates,
    dismissDuplicates,
    handleFieldChange,
    handleSubmit,
    resetForm
  } = useClientForm(client, onClose);

  useEffect(() => {
    if (isOpen) {
      getManagers().then(res => {
        if (res.success && res.data) setManagers(res.data);
      });
    }
  }, [isOpen]);

  // Синхронизация при смене клиента
  useEffect(() => {
    resetForm(client);
  }, [client, resetForm]);

  if (!client) return null;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Редактировать клиента" description="Измените необходимые поля" className="max-w-2xl max-h-[90vh]">
      <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
        <div className="flex-1 overflow-y-auto p-6 md:p-6 space-y-3 custom-scrollbar">
          <AnimatePresence>
            {hasDuplicates && (
              <DuplicateWarningBanner duplicates={duplicates} onOpenClient={(id) => window.open(`/dashboard/clients?id=${id}`, "_blank")}
                onDismiss={dismissDuplicates}
              />
            )}
          </AnimatePresence>

          <ClientTypeSwitch value={form.clientType} onChange={(val) => setForm(prev => ({ ...prev, clientType: val as "b2c" | "b2b" }))}
          />

          <div className="border-t border-slate-100 pt-3" />

          <ClientFormFields form={form} managers={managers} acquisitionSources={ACQUISITION_SOURCES} onFieldChange={handleFieldChange} onManagerChange={(val) => setForm(prev => ({ ...prev, managerId: val }))}
            onSourceChange={(val) => setForm(prev => ({ ...prev, acquisitionSource: val }))}
          />

          <SocialFields form={form} onFieldChange={handleFieldChange} />
        </div>

        <div className="p-6 md:p-6 pt-3 flex items-center justify-end gap-3 bg-white border-t border-slate-200 mt-auto flex-shrink-0">
          <Button type="button" variant="ghost" onClick={onClose} className="hidden md:flex h-11 px-8 border border-slate-200 text-slate-600 font-bold rounded-2xl bg-slate-50 hover:bg-white transition-all active:scale-[0.98] shadow-sm items-center justify-center">
            Отмена
          </Button>
          <Button type="submit" disabled={loading} className="h-11 w-full md:w-auto md:px-10 inline-flex items-center justify-center gap-2 rounded-[var(--radius-inner)] border border-transparent btn-dark text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98]">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

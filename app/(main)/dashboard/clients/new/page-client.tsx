"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  User,
  Phone,
  MessageSquare,
  RotateCcw,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { DuplicateWarningBanner } from "../components/duplicate-warning-banner";
import { DuplicateWarningModal } from "../components/duplicate-warning-modal";

import { useNewClientForm } from "./hooks/use-new-client-form";
import { Step0BasicInfo } from "./components/step-0-basic-info";
import { Step1Contacts } from "./components/step-1-contacts";
import { Step2Additional } from "./components/step-2-additional";

interface NewClientPageClientProps {
  managers: { id: string; name: string }[];
}

// === Унифицированные источники привлечения ===
const ACQUISITION_SOURCES = [
  { id: "", title: "Не указано" },
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

export function NewClientPageClient({ managers }: NewClientPageClientProps) {
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const {
    logicState,
    setLogicState,
    formData,
    updateFormData,
    handleReset,
    handleNext,
    handleBack,
    submitForm,
    validateStep,
    duplicates,
    allDuplicates,
    dismissDuplicates,
    hasDuplicates,
  } = useNewClientForm();

  const handleOpenClient = (clientId: string) => {
    window.open(`/dashboard/clients?id=${clientId}`, "_blank");
  };

  const handleSubmit = async () => {
    if (!validateStep(logicState.step)) return;

    if (hasDuplicates && !logicState.ignoreDuplicates) {
      setShowDuplicateModal(true);
      return;
    }

    await submitForm();
  };

  const steps = [
    {
      id: 0,
      title: logicState.clientType === "b2b" ? "Организация" : "Основное",
      desc: logicState.clientType === "b2b" ? "Компания и контакт" : "Тип и имя",
      icon: logicState.clientType === "b2b" ? Building2 : User
    },
    { id: 1, title: "Контакты", desc: "Связь с клиентом", icon: Phone },
    { id: 2, title: "Дополнительно", desc: "Детали и менеджер", icon: MessageSquare }
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-3 px-4 sm:px-8 pb-8 pt-4">
      <aside className="w-full md:w-[320px] bg-white border border-slate-200 rounded-3xl flex flex-col shrink-0 relative z-20 shadow-lg overflow-hidden h-auto md:h-full">
        <div className="p-6 shrink-0">
          <Button variant="ghost" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-all group text-sm p-0 h-auto hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Новый клиент</h1>
          <p className="text-xs text-slate-500 font-bold opacity-60 mt-1">Создание карточки в CRM</p>
        </div>

        <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
          {steps.map((s, idx) => {
            const isActive = logicState.step === s.id;
            const isCompleted = logicState.step > s.id;
            return (
              <Button key={idx} variant="ghost" onClick={() => {
                  if (isActive) return;
                  if (s.id < logicState.step || validateStep(logicState.step)) {
                    setLogicState(prev => ({ ...prev, step: s.id, validationError: "" }));
                  }
                }}
                className={cn("relative w-full justify-start p-4 h-auto rounded-[var(--radius)] transition-all duration-300 flex items-center gap-3 group",
                  isActive ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary" : "text-slate-400 hover:bg-slate-50 active:scale-[0.98]"
                )}
              >
                <div className={cn("w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                  isActive ? "bg-white/10 border-white/20" : isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-200"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <div className="min-w-0 text-left">
                  <div className={cn("text-xs font-bold leading-none mb-1", isActive ? "text-white" : "text-slate-900")}>{s.title}</div>
                  <div className={cn("text-xs font-bold truncate", isActive ? "text-white/60" : "text-slate-400")}>{s.desc}</div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="h-[80px] shrink-0 border-t border-slate-200 bg-white z-30 px-7 flex items-center">
          <Button variant="ghost" onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 h-auto rounded-2xl hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-xs font-bold text-slate-400 hover:text-slate-900 group">
            <RotateCcw className="w-3 h-3 group-hover:rotate-[-90deg] transition-transform duration-300" />
            Начать заново
          </Button>
        </div>
      </aside>

      <div className="flex-1 overflow-visible md:overflow-hidden h-full flex flex-col gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (logicState.step === 2) handleSubmit();
            else handleNext();
          }}
          className="bg-white rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden flex flex-col h-full min-h-[400px]"
        >
          <div className="flex-1 overflow-y-auto p-6 md:p-6 space-y-3">
            <AnimatePresence>
              {hasDuplicates && logicState.step < 2 && (
                <DuplicateWarningBanner duplicates={duplicates} onOpenClient={handleOpenClient} onDismiss={dismissDuplicates} />
              )}
            </AnimatePresence>

            {logicState.step === 0 && (
              <Step0BasicInfo clientType={logicState.clientType} setClientType={(val) => setLogicState(prev => ({ ...prev, clientType: val }))}
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {logicState.step === 1 && (
              <Step1Contacts formData={formData} updateFormData={updateFormData} />
            )}

            {logicState.step === 2 && (
              <Step2Additional formData={formData} updateFormData={updateFormData} managers={managers} sources={ACQUISITION_SOURCES} duplicates={duplicates} hasDuplicates={hasDuplicates} handleOpenClient={handleOpenClient} dismissDuplicates={dismissDuplicates} />
            )}
          </div>

          <div className="px-6 md:px-10 py-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-3">
            <div className="flex flex-col">
              {logicState.validationError && (
                <span className="text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">{logicState.validationError}</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleBack} className="px-6 py-3 h-auto rounded-[var(--radius-inner)] border-slate-200 text-sm font-bold text-slate-400 hover:text-slate-900 bg-white transition-all">
                Назад
              </Button>
              {logicState.step < 2 ? (
                <Button type="button" onClick={handleNext} className="px-8 py-3 h-auto btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 transition-all border-none">
                  Далее
                </Button>
              ) : (
                <Button type="submit" disabled={logicState.loading} className="px-8 py-3 h-auto btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 transition-all border-none">
                  {logicState.loading ? "Создание..." : "Создать клиента"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      <DuplicateWarningModal isOpen={showDuplicateModal} onClose={() => setShowDuplicateModal(false)}
        onIgnore={submitForm}
        onOpenClient={handleOpenClient}
        duplicates={allDuplicates}
        isLoading={logicState.loading}
      />
    </div>
  );
}

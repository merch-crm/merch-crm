"use client";

import React from "react";
import { Info, AlertCircle, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";

export function BentoAlerts() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      {/* Default - General information */}
      <div className="flex items-start gap-3 p-4 rounded-element bg-gray-100 dark:bg-[#18181b] border border-slate-100">
        <Info className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-foreground tracking-tight">Доступны новые функции</h4>
          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            Ознакомьтесь с нашими последними обновлениями, включая поддержку темной темы и улучшенные функции специальных возможностей.
          </p>
        </div>
      </div>

      {/* Accent - Important information with action */}
      <div className="flex items-start gap-3 p-4 rounded-element bg-gray-100 dark:bg-[#18181b] border border-slate-100">
        <Info className="w-5 h-5 mt-0.5 shrink-0 text-blue-500" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-blue-500 tracking-tight">Доступно обновление</h4>
          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            Доступна новая версия приложения. Пожалуйста, обновите страницу, чтобы получить последние функции и исправления ошибок.
          </p>
        </div>
        <button type="button" className="hidden sm:block shrink-0 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black rounded-full transition-colors">
          Обновить
        </button>
      </div>

      {/* Danger - Error with detailed steps */}
      <div className="flex items-start gap-3 p-4 rounded-element bg-gray-100 dark:bg-[#18181b] border border-slate-100">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-red-500 tracking-tight">Не удалось подключиться к серверу</h4>
          <div className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            Мы испытываем проблемы с подключением. Пожалуйста, попробуйте следующее:
            <ul className="mt-2 list-inside list-disc space-y-1 text-[11px] pl-1 font-bold">
              <li>Проверьте подключение к интернету</li>
              <li>Обновите страницу</li>
              <li>Очистите кэш браузера</li>
            </ul>
          </div>
        </div>
        <button type="button" className="hidden sm:block shrink-0 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-black rounded-full transition-colors">
          Повторить
        </button>
      </div>

      {/* Without description */}
      <div className="flex items-start justify-between gap-3 p-4 rounded-element bg-gray-100 dark:bg-[#18181b] border border-slate-100">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500" />
          <h4 className="text-[11px] font-black text-green-500 tracking-tight">Профиль успешно обновлен</h4>
        </div>
        <button type="button" aria-label="Закрыть уведомление" className="p-1 rounded-full text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Custom indicator - Loading state */}
      <div className="flex items-start gap-3 p-4 rounded-element bg-gray-100 dark:bg-[#18181b] border border-slate-100">
        <Loader2 className="w-5 h-5 mt-0.5 shrink-0 text-blue-500 animate-spin" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-blue-500 tracking-tight">Обработка вашего запроса</h4>
          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            Пожалуйста, подождите, пока мы синхронизируем ваши данные. Это может занять несколько секунд.
          </p>
        </div>
      </div>

      {/* Without close button */}
      <div className="flex items-start gap-3 p-4 rounded-element bg-gray-100 dark:bg-[#18181b] border border-slate-100">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-amber-500 tracking-tight">Плановое обслуживание</h4>
          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            Наши сервисы будут недоступны в воскресенье, 15 марта, с 2:00 до 6:00 UTC для проведения планового обслуживания.
          </p>
        </div>
      </div>
    </div>
  );
}

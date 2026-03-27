/**
 * @fileoverview Унифицированный layout для всех калькуляторов
 * @module calculators/components/UnifiedCalculatorLayout
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25, последнее обновление 2026-03-27
 */

'use client';

import React, { ReactNode, ElementType } from 'react';
import { Settings, ArrowLeft, Save, FileDown, Printer } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CalculatorType,
  CALCULATOR_TYPES_CONFIG,
} from '@/lib/types/calculators';

/**
 * Пропсы компонента заголовка калькулятора.
 */
type CalculatorHeaderProps =
  | {
      /** Тип калькулятора (режим авто-конфига) */
      calculatorType: CalculatorType;
      title?: never;
      description?: never;
      icon?: never;
      headerActions?: ReactNode;
      onSettingsClick?: () => void;
      showSettings?: boolean;
    }
  | {
      /** Заголовок (явный режим) */
      title: string;
      /** Описание (явный режим) */
      description?: string;
      /** Иконка (явный режим) */
      icon?: ElementType;
      /** Действия справа (явный режим) */
      headerActions?: ReactNode;
      calculatorType?: never;
      onSettingsClick?: never;
      showSettings?: never;
    };

/**
 * Заголовок калькулятора с названием, описанием и выбором клиента
 */
export function CalculatorHeader(props: CalculatorHeaderProps) {
  let title: string = '';
  let description: string | undefined;
  let showSettings = false;
  let onSettingsClick: (() => void) | undefined;
  const actions: ReactNode = props.headerActions;

  if ('calculatorType' in props && props.calculatorType) {
    const config = CALCULATOR_TYPES_CONFIG[props.calculatorType];
    title = config?.label ?? String(props.calculatorType);
    description = config?.description;
    showSettings = props.showSettings !== false;
    onSettingsClick = props.onSettingsClick;
  } else {
    // Явный режим (без calculatorType)
    const p = props as { title: string; description?: string; icon?: ElementType };
    title = p.title;
    description = p.description;
  }

  return (
    <div className="crm-card flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-none hover:shadow-none">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/production/calculators">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p 
              className="text-sm text-slate-500 font-medium"
              suppressHydrationWarning
            >
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:ml-auto">
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {showSettings && (
            <Button
              variant="outline"
              size="icon"
              onClick={onSettingsClick}
              className="rounded-xl h-12 w-12 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
              title="Настройки расходников"
            >
              <Settings className="h-5 w-5 text-slate-600" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Пропсы секции калькулятора
 */
interface CalculatorSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Пропсы для кнопок действий
 */
export interface CalculatorActionsProps {
  onSave: () => void;
  onDownloadClient?: () => void;
  onPrint?: () => void;
  isLoading?: boolean;
  canSave?: boolean;
}

/**
 * Кнопки действий (Сохранить, PDF, Печать)
 */
export function CalculatorActions({
  onSave,
  onDownloadClient,
  onPrint,
  isLoading,
  canSave = true,
}: CalculatorActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={onSave}
        disabled={!canSave || isLoading}
        className="rounded-xl h-11 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        Сохранить
      </Button>

      {onDownloadClient && (
        <Button
          variant="outline"
          onClick={onDownloadClient}
          disabled={!canSave || isLoading}
          className="rounded-xl h-11 px-6 font-bold border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all shadow-sm flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Скачать расчет
        </Button>
      )}

      {onPrint && (
        <Button
          variant="outline"
          onClick={onPrint}
          disabled={!canSave || isLoading}
          className="rounded-xl h-11 px-4 font-bold border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all shadow-sm flex items-center gap-2"
          title="Печать"
        >
          <Printer className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Секция калькулятора с заголовком
 */
export function CalculatorSection({
  title,
  description,
  children,
  className,
}: CalculatorSectionProps) {
  return (
    <div className={`crm-card hover:shadow-md transition-shadow duration-300 ${className || ''}`}>
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 font-medium mt-1">{description}</p>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Пропсы основного макета калькулятора
 */
interface UnifiedCalculatorLayoutProps {
  calculatorType: CalculatorType;
  children: ReactNode;
  onSettingsClick?: () => void;
  resultBlock?: ReactNode;
  headerActions?: ReactNode;
}

/**
 * Основной макет калькулятора
 */
export function UnifiedCalculatorLayout({
  calculatorType,
  children,
  onSettingsClick,
  resultBlock,
  headerActions,
}: UnifiedCalculatorLayoutProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-3 pb-20 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <div className="xl:col-span-8 h-96 bg-slate-50 rounded-xl" />
          <div className="xl:col-span-4 h-96 bg-slate-50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col gap-3 pb-20 max-w-[1600px] mx-auto"
      suppressHydrationWarning
    >
      <CalculatorHeader
        calculatorType={calculatorType}
        onSettingsClick={onSettingsClick}
        headerActions={headerActions}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        <div className="xl:col-span-8 space-y-3 order-2 xl:order-1">
          {children}
        </div>

        <aside className="xl:col-span-4 space-y-3 order-1 xl:order-2 sticky top-8">
          {resultBlock}
        </aside>
      </div>
    </div>
  );
}

export default UnifiedCalculatorLayout;

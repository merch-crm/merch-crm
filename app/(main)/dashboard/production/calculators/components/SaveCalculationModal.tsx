/**
 * @fileoverview Модалка сохранения расчёта
 * @module calculators/components/SaveCalculationModal
 * @requires @/lib/types/calculators
 * @audit Создан 2026-03-25
 */

'use client';

import { useState, useEffect } from 'react';
import {
 ResponsiveModal,
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { SubmitButton } from '@/components/ui/submit-button';
import { ClientSelect } from './ClientSelect';

/**
 * Данные для сохранения расчёта
 */
export interface SaveCalculationData {
 /** Название расчёта (обязательное) */
 name: string;
 /** Комментарий (опциональный) */
 comment?: string;
 /** Имя клиента (опциональное) */
 clientName?: string;
 /** ID клиента из базы (опциональное) */
 clientId?: string;
}

/**
 * Пропсы модалки сохранения
 */
interface SaveCalculationModalProps {
 /** Открыта ли модалка */
 isOpen: boolean;
 /** Обработчик закрытия */
 onClose: () => void;
 /** Обработчик сохранения */
 onSave: (data: SaveCalculationData) => Promise<void>;
 /** Состояние загрузки */
 isLoading?: boolean;
 /** Предзаполненные данные */
 defaultName?: string;
 defaultComment?: string;
 defaultClientName?: string;
 defaultClientId?: string;
}

/**
 * Модалка сохранения расчёта с обязательным названием
 */
export function SaveCalculationModal({
 isOpen,
 onClose,
 onSave,
 isLoading = false,
 defaultName = '',
 defaultComment = '',
 defaultClientName = '',
 defaultClientId = '',
}: SaveCalculationModalProps) {
 const [name, setName] = useState(defaultName);
 const [comment, setComment] = useState(defaultComment);
 const [clientId, setClientId] = useState(defaultClientId);
 const [clientName, setClientName] = useState(defaultClientName);
 const [error, setError] = useState<string | null>(null);

 /**
  * Синхронизация состояния при открытии модалки или изменении начальных значений
  */
 useEffect(() => {
  if (isOpen) {
   setName(defaultName);
   setComment(defaultComment);
   setClientId(defaultClientId);
   setClientName(defaultClientName);
  }
 }, [isOpen, defaultName, defaultComment, defaultClientId, defaultClientName]);

 /**
  * Обработчик отправки формы
  */
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // Валидация названия
  const trimmedName = name.trim();
  if (!trimmedName) {
   setError('Введите название расчёта');
   return;
  }

  if (trimmedName.length < 3) {
   setError('Название должно содержать минимум 3 символа');
   return;
  }

  if (trimmedName.length > 100) {
   setError('Название не должно превышать 100 символов');
   return;
  }

  try {
   await onSave({
    name: trimmedName,
    comment: comment.trim() || undefined,
    clientId,
    clientName,
   });
   // Сбрасываем форму после успешного сохранения
   setName('');
   setComment('');
  } catch (_err) {
   setError('Не удалось сохранить расчёт');
  }
 };

 /**
  * Обработчик закрытия с очисткой
  */
 const handleClose = () => {
  setError(null);
  onClose();
 };

 return (
  <ResponsiveModal isOpen={isOpen} onClose={handleClose} title="Сохранить расчёт" description="Введите название для сохранения расчёта в историю" footer={ <div className="flex justify-end gap-3 w-full">
     <Button type="button" variant="outline" onClick={handleClose} className="rounded-[12px] h-11 px-6 font-semibold">
      Отмена
     </Button>
     <SubmitButton isLoading={isLoading} loadingText="Сохранение..." form="save-calculation-form" className="rounded-[12px] h-11 px-6 font-semibold bg-slate-900 hover:bg-slate-800 text-white">
      Сохранить
     </SubmitButton>
    </div>
   }
  >
   <form id="save-calculation-form" onSubmit={handleSubmit} className="space-y-3 px-6 py-4">
    {/* Название (обязательное) */}
    <div className="space-y-2">
     <Label htmlFor="calc-name">
      Название расчёта <span className="text-destructive">*</span>
     </Label>
     <Input id="calc-name" value={name} onChange={(e) => {
       setName(e.target.value);
       setError(null);
      }}
      placeholder="Например: Футболки для ООО Рога и копыта"
      className="rounded-md"
      autoFocus
      maxLength={100}
     />
     {error && (
      <div className="flex items-center gap-2 text-sm text-destructive">
       <AlertCircle className="h-4 w-4" />
       <span>{error}</span>
      </div>
     )}
    </div>

    {/* Выбор клиента (опциональный) */}
    <div className="space-y-2">
     <Label>Клиент</Label>
     <ClientSelect value={clientId} defaultValue={clientName} onSelect={(client) => {
       setClientId(client?.id || '');
       setClientName(client?.displayName || '');
      }}
     />
    </div>



    {/* Комментарий (опциональный) */}
    <div className="space-y-2">
     <Label htmlFor="comment">Комментарий</Label>
     <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
      placeholder="Дополнительная информация..."
      className="rounded-md resize-none"
      rows={3}
      maxLength={500}
     />
     <p className="text-xs text-muted-foreground text-right">
      {comment.length}/500
     </p>
    </div>
   </form>
  </ResponsiveModal>
 );
}

export default SaveCalculationModal;

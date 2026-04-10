'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileDown, Loader2, X } from 'lucide-react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usePDFGenerator } from '@/app/(main)/dashboard/production/calculators/hooks/use-pdf-generator';
import { type PDFBrandingSettings, type PDFDocumentType, PDF_DOCUMENT_TYPE_NAMES } from '@/lib/types/pdf';

interface PDFPreviewModalProps {
 isOpen: boolean;
 onClose: () => void;
 branding: PDFBrandingSettings;
}

/**
 * Модалка предпросмотра PDF с тестовыми данными
 */
export function PDFPreviewModal({ isOpen, onClose, branding }: PDFPreviewModalProps) {
 const [documentType, setDocumentType] = useState<PDFDocumentType>('calculation');
 const { isGenerating, generateAndDownload, generateAndOpen } = usePDFGenerator();

 // Тестовые данные для предпросмотра
 const testData = {
  number: 'CALC-2026-00001',
  name: 'Тестовый расчёт',
  calculatorType: 'dtf' as const,
  date: new Date(), // suppressHydrationWarning
  clientName: 'ООО «Тестовый клиент»',
  clientContact: '+7 (999) 123-45-67',
  parameters: {
   quantity: 100,
   width: 150,
   height: 200,
   printArea: 0.03,
   filmLength: 1.5,
  },
  consumables: [
   {
    name: 'Плёнка DTF',
    pricePerUnit: 500,
    consumptionPerUnit: 0.015,
    unit: 'м²',
    cost: 750,
   },
   {
    name: 'Чернила CMYK',
    pricePerUnit: 3000,
    consumptionPerUnit: 0.01,
    unit: 'л',
    cost: 300,
   },
  ],
  placements: [
   {
    productName: 'Футболка',
    zoneName: 'Грудь',
    quantity: 100,
    pricePerUnit: 50,
    cost: 5000,
   },
  ],
  designFiles: [
   {
    name: 'logo.png',
    dimensions: '150 × 200 мм',
    quantity: 1,
   },
  ],
  totals: {
   costPrice: 6050,
   marginPercent: 30,
   sellingPrice: 7865,
   pricePerItem: 78.65,
   consumablesCost: 1050,
   placementsCost: 5000,
   urgencySurcharge: 0,
  },
  comment: 'Тестовый расчёт для предпросмотра PDF',
 };

 const handlePreview = async () => {
  await generateAndOpen(testData, { documentType });
 };

 const handleDownload = async () => {
  await generateAndDownload(testData, { documentType });
 };

 return (
  <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Предпросмотр PDF" description="Посмотрите, как будет выглядеть документ с текущими настройками">
   <div className="space-y-3 p-4">
    {/* Выбор типа документа */}
    <div className="space-y-2">
     <Label>Тип документа</Label>
     <Select value={documentType} onChange={(value) => setDocumentType(value as PDFDocumentType)}
      options={Object.entries(PDF_DOCUMENT_TYPE_NAMES).map(([key, label]) => ({
       id: key,
       title: label,
      }))}
     />
    </div>

    {/* Превью настроек */}
    <div className="rounded-lg border p-4 space-y-2">
     <div className="flex items-center gap-3">
      {branding.logoUrl && (
       <div className="relative w-12 h-12">
        <Image src={branding.logoUrl} alt="Логотип" fill className="object-contain" />
       </div>
      )}
      <div>
       <p className="font-medium">{branding.companyName}</p>
       <p className="text-sm text-muted-foreground">
        {branding.phone || branding.email || 'Контакты не указаны'}
       </p>
      </div>
     </div>
     <div className="flex gap-2">
      <div 
       className="w-6 h-6 rounded" 
       style={{ backgroundColor: branding.primaryColor }}
      />
      <div 
       className="w-6 h-6 rounded" 
       style={{ backgroundColor: branding.secondaryColor }}
      />
     </div>
    </div>

    {/* Кнопки действий */}
    <div className="flex justify-end gap-2">
     <Button variant="outline" onClick={onClose}>
      <X className="h-4 w-4 mr-2" />
      Закрыть
     </Button>
     <Button variant="outline" onClick={handlePreview} disabled={isGenerating}>
      {isGenerating ? (
       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
       <FileDown className="h-4 w-4 mr-2" />
      )}
      Открыть
     </Button>
     <Button onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? (
       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
       <FileDown className="h-4 w-4 mr-2" />
      )}
      Скачать
     </Button>
    </div>
   </div>
  </ResponsiveModal>
 );
}

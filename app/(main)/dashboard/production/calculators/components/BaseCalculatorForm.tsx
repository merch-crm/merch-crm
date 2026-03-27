import React, { useState } from 'react';
import {
  UnifiedCalculatorLayout,
  CalculatorSection,
  CalculatorActions,
} from './UnifiedCalculatorLayout';
import { CalculatorResultBlock } from './CalculatorResultBlock';
import { DesignFileUploader } from './DesignFileUploader';
import { DesignFilesList } from './DesignFilesList';
import { SchematicRollVisualizer } from './SchematicRollVisualizer';
import { PlacementsSection } from './PlacementsSection';
import { GlobalSettingsModal } from './GlobalSettingsModal';
import { ConsumablesCostSummary } from './ConsumablesCostSummary';
import { SaveCalculationModal } from './SaveCalculationModal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type CalculatorType, CALCULATOR_TYPES_CONFIG } from '@/lib/types/calculators';
import { CalculationEngine } from '@/lib/services/calculators/calculation-engine';
import { usePDFGenerator } from '../hooks/use-pdf-generator';
import { formatCount } from '@/lib/pluralize';
 
import type { useCalculator } from '../hooks/use-calculator';

interface BaseCalculatorFormProps<T extends CalculatorType> {
  calculatorType: T;
  calculator: ReturnType<typeof useCalculator<T>>;
  children: React.ReactNode;
  filesSectionTitle?: string;
  showRollVisualizer?: boolean;
  beforeFilesContent?: React.ReactNode;
  afterFilesContent?: React.ReactNode;
  calculateButtonText?: string;
}

export function BaseCalculatorForm<T extends CalculatorType>({
  calculatorType,
  calculator,
  children,
  filesSectionTitle,
  showRollVisualizer = false,
  beforeFilesContent,
  afterFilesContent,
  calculateButtonText = 'Рассчитать стоимость',
}: BaseCalculatorFormProps<T>) {
  const { params, updateParams, designFiles, layout, globalSettings, placements, result, state } = calculator;
  const { terminology: term } = CALCULATOR_TYPES_CONFIG[calculatorType];
  const pdfGenerator = usePDFGenerator();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const resolvedFilesTitle = filesSectionTitle || (
    designFiles.files.length > 0
      ? `${formatCount(designFiles.files.length, 'Макет', 'Макета', 'Макетов')} ${term.itemGenitive}`
      : `Макеты ${term.itemGenitive}`
  );

  const unsafeParams = params as unknown as Record<string, unknown>;

  const calculationStats = {
    quantity: Number(unsafeParams.quantity) || 1,
    stitchCount: designFiles.files.reduce(
      (sum, f) => sum + (f.embroideryData?.stitchCount || 0) * f.quantity,
      0
    ),
    areaM2: (layout.layoutResult?.stats?.[
      calculatorType === 'dtf' || calculatorType === 'uv-dtf' ? 'totalAreaMm2' : 'usedAreaMm2'
    ] || 0) / 1000000,
    colorCount: unsafeParams.colorCount !== undefined ? Number(unsafeParams.colorCount) : undefined,
  };

  const handleSave = async (data: { name: string; clientId?: string; comment?: string }) => {
    const success = await calculator.save(data.name, data.clientId, data.comment);
    if (success) {
      setShowSaveModal(false);
    }
  };

  return (
    <UnifiedCalculatorLayout
      calculatorType={calculatorType}
      onSettingsClick={() => setIsSettingsOpen(true)}
      resultBlock={
        <div className="space-y-3">
          <CalculatorResultBlock
            costBreakdown={result?.costBreakdown || { total: 0, print: 0, materials: 0, placements: 0 }}
            quantity={Number(unsafeParams.quantity) || 1}
            marginPercent={Number(unsafeParams.marginPercent) || 0}
            onMarginChange={(margin) => updateParams({ marginPercent: margin } as Partial<typeof params>)}
            sellingPrice={result?.sellingPrice || 0}
            onSellingPriceChange={(price) => {
              const newMargin = CalculationEngine.calculateMarginFromPrice(
                result?.totalCost || 0,
                price,
                Boolean(unsafeParams.isUrgent),
                Number(unsafeParams.urgencySurchargePercent) || 0
              );
              updateParams({ marginPercent: Math.round(newMargin) } as Partial<typeof params>);
            }}
            urgencySettings={{
              level: unsafeParams.isUrgent ? 'urgent' : 'normal',
              surcharge: Number(result?.urgency?.surcharge || 0),
              urgentSurcharge: Number(unsafeParams.urgencySurchargePercent) || 0,
            }}
            urgencyLevel={unsafeParams.isUrgent ? 'urgent' : 'normal'}
            onUrgencyChange={(level) => updateParams({ isUrgent: level === 'urgent' } as Partial<typeof params>)}
          />

          <ConsumablesCostSummary
            config={globalSettings.settings.consumablesConfig}
            stats={calculationStats}
          />
        </div>
      }
      headerActions={
        <CalculatorActions
          onSave={() => setShowSaveModal(true)}
          isLoading={state.isSaving || pdfGenerator.isGenerating}
          canSave={!!result}
          onDownloadClient={async () => {
             const data = calculator.getPDFData();
             if (data) await pdfGenerator.generateAndDownload(data);
          }}
          onPrint={async () => {
             const data = calculator.getPDFData();
             if (data) await pdfGenerator.generateAndOpen(data);
          }}
        />
      }
    >
      {children}
      <Separator />

      {beforeFilesContent && (
        <>
          {beforeFilesContent}
          <Separator />
        </>
      )}

      <CalculatorSection title={resolvedFilesTitle}>
        <div className="p-4 bg-muted/30 border-2 border-dashed border-muted-foreground/10 rounded-xl space-y-3">
          <DesignFileUploader
            calculatorType={calculatorType}
            onUploadSuccess={(file) => designFiles.addFile(file)}
          />
          
          {designFiles.files.length > 0 && (
            <DesignFilesList
              files={designFiles.files}
              onRemove={designFiles.removeFile}
              onUpdate={designFiles.updateFile}
              onReorder={designFiles.reorderFiles}
            />
          )}
        </div>
      </CalculatorSection>

      {afterFilesContent && (
        <>
          <Separator />
          {afterFilesContent}
        </>
      )}

      {showRollVisualizer && designFiles.files.length > 0 && (
        <>
          <Separator />
          <SchematicRollVisualizer
            designs={layout.designItems}
            initialSettings={layout.settings}
            onSettingsChange={layout.updateSettings}
          />
        </>
      )}

      <Separator />

      <PlacementsSection
        products={placements.availableProducts}
        selectedPlacements={placements.selectedPlacements}
        onToggle={placements.togglePlacement}
        onClear={placements.clearPlacements}
        isLoading={placements.isLoading}
      />

      <Separator />

      <div className="flex flex-col items-center gap-3 pt-6 pb-12">
        <Button
          size="lg"
          onClick={calculator.calculate}
          disabled={!calculator.canCalculate || state.isCalculating}
          className="w-full max-w-sm h-14 text-lg font-black shadow-xl transition-all hover:scale-105 active:scale-95 rounded-xl"
        >
          {state.isCalculating ? 'Расчёт...' : calculateButtonText}
        </Button>
        
        {calculator.validationErrors.length > 0 && (
          <p className="text-sm text-destructive font-medium bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20 mt-2 text-center">
            {calculator.validationErrors[0]}
          </p>
        )}
      </div>

      <SaveCalculationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        isLoading={state.isSaving}
        defaultClientId={unsafeParams.clientId ? String(unsafeParams.clientId) : undefined}
        defaultClientName={unsafeParams.clientName ? String(unsafeParams.clientName) : undefined}
      />

      <GlobalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        calculatorType={calculatorType}
        settings={globalSettings.settings}
        onSave={async (s) => { await globalSettings.saveSettings(s); }}
        onReset={async () => { await globalSettings.resetSettings(); }}
      />
    </UnifiedCalculatorLayout>
  );
}

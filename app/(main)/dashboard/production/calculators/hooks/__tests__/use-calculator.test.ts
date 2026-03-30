// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { useCalculator } from '../use-calculator';
import { CalculationEngine } from '@/lib/services/calculators/calculation-engine';
import * as historyActions from '@/lib/actions/calculators/history';
import { DEFAULT_CALCULATOR_PARAMS } from '@/lib/types/calculator-configs';

// Import the hooks to mock them properly with vi.mocked
import { useDesignFiles } from '../use-design-files';
import { useLayoutOptimizer } from '../use-layout-optimizer';
import { useCalculatorSettings } from '../use-calculator-settings';
import { usePlacements } from '../use-placements';

import type { CalculationResult, UploadedDesignFile } from '@/lib/types/calculators';

// Mocks
vi.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: vi.fn((_key: string, initialValue: unknown) => [initialValue, vi.fn()]),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/services/calculators/calculation-engine', () => ({
  CalculationEngine: {
    calculate: vi.fn().mockReturnValue({
      totalCost: 100,
      sellingPrice: 150,
      pricePerItem: 1.5,
      costBreakdown: { materials: 50, placements: 50, labor: 0 },
      urgency: { surcharge: 0 },
      consumables: [],
      placements: [],
    } as unknown as CalculationResult),
  },
}));

vi.mock('../use-design-files');
vi.mock('../use-layout-optimizer');
vi.mock('../use-calculator-settings');
vi.mock('../use-placements');
vi.mock('@/lib/actions/calculators/history');

describe('useCalculator', () => {
  const mockDesignFilesReturn = {
    files: [] as UploadedDesignFile[],
    addFile: vi.fn(),
    removeFile: vi.fn(),
    updateFile: vi.fn(),
    clearAll: vi.fn(),
    stats: { totalAreaM2: 0, totalStitches: 0, totalQuantity: 0, fileCount: 0 },
  };

  const mockLayoutReturn = {
    layoutResult: {
      stats: { usedAreaMm2: 0, totalAreaMm2: 0, totalLengthMm: 0, efficiency: 0 },
      settings: {},
      placements: [],
      skippedDesigns: [],
    },
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    designItems: [],
    stats: { usedAreaMm2: 0, totalAreaMm2: 0, totalLengthMm: 0, efficiency: 0 },
    efficiency: 0,
    totalLengthMm: 0,
  };

  const mockSettingsReturn = {
    settings: { consumablesConfig: { items: [] } },
    updateSettings: vi.fn(),
    loadSettings: vi.fn(),
    saveSettings: vi.fn(),
    resetSettings: vi.fn(),
    isSettingsModalOpen: false,
    openSettingsModal: vi.fn(),
    closeSettingsModal: vi.fn(),
    isLoading: false,
  };

  const mockPlacementsReturn = {
    selectedPlacements: [],
    availableProducts: [],
    costResults: { totalWorkPrice: 0, totalItems: 0 },
    isLoading: false,
    togglePlacement: vi.fn(),
    clearPlacements: vi.fn(),
    setSelectedPlacements: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks for sub-hooks
    vi.mocked(useDesignFiles).mockReturnValue(mockDesignFilesReturn as unknown as ReturnType<typeof useDesignFiles>);
    vi.mocked(useLayoutOptimizer).mockReturnValue(mockLayoutReturn as unknown as ReturnType<typeof useLayoutOptimizer>);
    vi.mocked(useCalculatorSettings).mockReturnValue(mockSettingsReturn as unknown as ReturnType<typeof useCalculatorSettings>);
    vi.mocked(usePlacements).mockReturnValue(mockPlacementsReturn as unknown as ReturnType<typeof usePlacements>);
  });

  it('should initialize with default parameters for DTF', () => {
    const { result } = renderHook(() => useCalculator('dtf'));
    
    expect(result.current.params).toEqual(DEFAULT_CALCULATOR_PARAMS['dtf']);
    expect(result.current.state.isSaving).toBe(false);
    expect(result.current.state.error).toBe(null);
  });

  it('should prevent calculation if validation fails', () => {
    const { result } = renderHook(() => useCalculator('dtf'));
    
    expect(result.current.canCalculate).toBe(false);
    expect(result.current.validationErrors).toContain('Добавьте макет для расчёта');
  });

  it('should trigger CalculationEngine when valid', () => {
    const mockFileData: UploadedDesignFile = { 
      id: 'f1', 
      quantity: 1, 
      originalName: 'test.png',
      storedName: 'test-uuid',
      mimeType: 'image/png',
      filePath: '/tmp/test.png',
      fileUrl: 'url-1',
      sizeBytes: 1024,
      calculatorType: 'dtf',
      uploadedAt: new Date()
    };

    vi.mocked(useDesignFiles).mockReturnValue({
      ...mockDesignFilesReturn,
      files: [mockFileData],
      stats: { totalAreaM2: 0.1, totalStitches: 5000, totalQuantity: 1, fileCount: 1 }
    } as unknown as ReturnType<typeof useDesignFiles>);

    renderHook(() => useCalculator('dtf'));
    
    expect(CalculationEngine.calculate).toHaveBeenCalled();
  });

  it('should handle saving process', async () => {
    vi.mocked(historyActions.saveCalculation).mockResolvedValue({
      success: true,
      data: { 
        calculationNumber: 'CALC-001',
        id: 'some-uuid',
        name: 'Test Calc',
        calculatorType: 'dtf',
        totalCost: '100',
        sellingPrice: '150',
        quantity: '1',
        pricePerItem: '150',
        marginPercent: '50',
        createdAt: new Date(),
        createdBy: 'user-1',
      }
    } as unknown as Awaited<ReturnType<typeof historyActions.saveCalculation>>);

    vi.mocked(useDesignFiles).mockReturnValue({
      ...mockDesignFilesReturn,
      files: [{ 
        id: 'f1', 
        quantity: 1, 
        originalName: 'test.png',
        storedName: 'test-uuid',
        mimeType: 'image/png',
        filePath: '/tmp/test.png',
        fileUrl: 'url-1',
        sizeBytes: 1024,
        calculatorType: 'dtf',
        uploadedAt: new Date()
      }] as UploadedDesignFile[],
      stats: { totalAreaM2: 0.1, totalStitches: 0, totalQuantity: 1, fileCount: 1 }
    } as unknown as ReturnType<typeof useDesignFiles>);

    const { result } = renderHook(() => useCalculator('dtf'));
    
    // Explicitly check that calculation is possible before saving
    expect(result.current.canCalculate).toBe(true);

    let success;
    await act(async () => {
      success = await result.current.save('Test Calc');
    });

    expect(success).toBe(true);
    expect(historyActions.saveCalculation).toHaveBeenCalled();
  });

  it('should prepare PDF data correctly', async () => {
    vi.mocked(useDesignFiles).mockReturnValue({
      ...mockDesignFilesReturn,
      files: [{ 
        id: 'f1', 
        quantity: 1, 
        originalName: 'test.png',
        storedName: 'test-uuid',
        mimeType: 'image/png',
        filePath: '/tmp/test.png',
        fileUrl: 'url-1',
        sizeBytes: 1024,
        calculatorType: 'dtf',
        uploadedAt: new Date()
      }] as UploadedDesignFile[],
      stats: { totalAreaM2: 0.1, totalStitches: 0, totalQuantity: 1, fileCount: 1 }
    } as unknown as ReturnType<typeof useDesignFiles>);

    const { result } = renderHook(() => useCalculator('dtf'));
    
    // Ensure canCalculate becomes true and result is computed
    expect(result.current.canCalculate).toBe(true);
    
    const pdfData = result.current.getPDFData();
    expect(pdfData).not.toBeNull();
    expect(pdfData?.calculatorType).toBe('dtf');
  });
});

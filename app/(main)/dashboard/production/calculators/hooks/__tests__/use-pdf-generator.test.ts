// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { usePDFGenerator } from '../use-pdf-generator';
import type { PDFCalculationData } from '@/lib/types/pdf';

// Mocks
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// Mock URL
global.URL.createObjectURL = vi.fn(() => 'blob:url');
global.URL.revokeObjectURL = vi.fn();

describe('usePDFGenerator', () => {
  const mockData: PDFCalculationData = {
    number: 'CALC-001',
    name: 'Test Calc',
    calculatorType: 'dtf',
    date: new Date(),
    parameters: {
      quantity: 10,
    },
    consumables: [],
    placements: [],
    designFiles: [],
    totals: {
      costPrice: 100,
      marginPercent: 30,
      sellingPrice: 130,
      pricePerItem: 13,
      consumablesCost: 50,
      placementsCost: 50,
      urgencySurcharge: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePDFGenerator());
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle successful PDF generation', async () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
    fetchMock.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      clone: function() { return this; },
      headers: {
        get: () => 'attachment; filename="test.pdf"',
      },
    } as unknown as Response);

    const { result } = renderHook(() => usePDFGenerator());

    await act(async () => {
      await result.current.generateBlob(mockData);
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(result.current.isGenerating).toBe(false);
  });

  it('should handle generation error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
      clone: function() { return this; },
    } as unknown as Response);

    const { result } = renderHook(() => usePDFGenerator());

    await act(async () => {
      await result.current.generateBlob(mockData);
    });

    expect(result.current.error).toBe('Server error');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDesignFiles } from '../use-design-files';
import * as filesActions from '@/lib/actions/calculators/files';
import type { UploadedDesignFile } from '@/lib/types/calculators';
import type { ActionResult } from '@/lib/types';

// Mocks
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/actions/calculators/files', () => ({
  deleteDesignFile: vi.fn(),
  getUserDesignFiles: vi.fn(),
}));

describe('useDesignFiles', () => {
  const mockFile: Partial<UploadedDesignFile> & { id: string } = {
    id: 'test-1',
    originalName: 'test.png',
    quantity: 1,
    userDimensions: { widthMm: 100, heightMm: 100 },
    calculatorType: 'dtf',
    uploadedAt: new Date(),
    storedName: 'test.png',
    sizeBytes: 1024,
    mimeType: 'image/png',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with provided initial files', () => {
    const { result } = renderHook(() => useDesignFiles({ 
      calculatorType: 'dtf', 
      initialFiles: [mockFile as unknown as UploadedDesignFile] 
    }));
    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].id).toBe('test-1');
  });

  it('should add a file to the list', () => {
    const { result } = renderHook(() => useDesignFiles({ calculatorType: 'dtf' }));
    
    act(() => {
      result.current.addFile(mockFile as unknown as UploadedDesignFile);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].originalName).toBe('test.png');
  });

  it('should update file parameters and recalculate stats', () => {
    const { result } = renderHook(() => useDesignFiles({ calculatorType: 'dtf' }));
    
    act(() => {
      result.current.addFile(mockFile as unknown as UploadedDesignFile);
    });

    act(() => {
      result.current.updateFile('test-1', { quantity: 10 });
    });

    expect(result.current.files[0].quantity).toBe(10);
    // Area of 100x100mm = 0.01m2. 10 files = 0.1m2
    expect(result.current.stats.totalAreaM2).toBeCloseTo(0.1, 4);
    expect(result.current.stats.totalQuantity).toBe(10);
  });

  it('should handle file removal', async () => {
    (vi.mocked(filesActions.deleteDesignFile)).mockResolvedValue({ 
      success: true, 
      data: { success: true } 
    } as unknown as ActionResult<{ success: boolean }>);
    
    const { result } = renderHook(() => useDesignFiles({ 
      calculatorType: 'dtf', 
      initialFiles: [mockFile as unknown as UploadedDesignFile] 
    }));
    
    await act(async () => {
      await result.current.removeFile('test-1');
    });

    expect(result.current.files).toHaveLength(0);
  });
});

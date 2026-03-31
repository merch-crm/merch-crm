// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { useLayoutOptimizer } from '../use-layout-optimizer';
import type { UploadedDesignFile } from '@/lib/types/calculators';

describe('useLayoutOptimizer', () => {
  const mockFiles: UploadedDesignFile[] = [
    { 
      id: 'file-1', 
      originalName: 'Design 1', 
      storedName: 'design-1-uuid',
      mimeType: 'image/png',
      filePath: '/tmp/design-1.png',
      fileUrl: 'url-1', 
      sizeBytes: 1024,
      dimensions: { width: 300, height: 300 },
      quantity: 1,
      calculatorType: 'dtf',
      uploadedAt: new Date()
    },
  ];

  it('should compute layout from files', () => {
    const { result } = renderHook(() => useLayoutOptimizer({ files: mockFiles }));
    
    expect(result.current.designItems).toHaveLength(1);
    expect(result.current.designItems[0].name).toBe('Design 1');
    expect(result.current.layoutResult).toBeDefined();
    expect(result.current.stats).toBeDefined();
  });

  it('should update settings and recompute', () => {
    const { result } = renderHook(() => useLayoutOptimizer({ files: mockFiles }));
    
    act(() => {
      result.current.updateSettings({ rollWidthMm: 600 });
    });

    expect(result.current.settings.rollWidthMm).toBe(600);
  });

  it('should reset settings to initial', () => {
    const initialSettings = { rollWidthMm: 450 };
    const { result } = renderHook(() => useLayoutOptimizer({ 
      files: mockFiles, 
      initialSettings 
    }));
    
    act(() => {
      result.current.updateSettings({ rollWidthMm: 600 });
      result.current.resetSettings();
    });

    expect(result.current.settings.rollWidthMm).toBe(450);
  });
});

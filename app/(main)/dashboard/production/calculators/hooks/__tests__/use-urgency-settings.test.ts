// NO IMPORTS FROM VITEST - using globals: true
import { renderHook, act } from '@testing-library/react';
import { useUrgencySettings } from '../use-urgency-settings';
import type { UrgencySettings } from '@/lib/types/calculators';

describe('useUrgencySettings', () => {
 const initialSettings: UrgencySettings = {
  level: 'normal',
  surcharge: 0,
  urgentSurcharge: 1000,
 };

 it('should initialize with default settings', () => {
  const { result } = renderHook(() => useUrgencySettings());
  expect(result.current.level).toBe('normal');
  expect(result.current.surcharge).toBe(0);
  expect(result.current.settings.urgentSurcharge).toBe(1000);
 });

 it('should initialize with custom settings', () => {
  const customSettings = { urgentSurcharge: 2000 };
  const { result } = renderHook(() => useUrgencySettings(customSettings));
  expect(result.current.settings.urgentSurcharge).toBe(2000);
 });

 it('should toggle urgency level', () => {
  const { result } = renderHook(() => useUrgencySettings(initialSettings));
  
  act(() => {
   result.current.toggleUrgency();
  });

  expect(result.current.level).toBe('urgent');
  expect(result.current.surcharge).toBe(1000);

  act(() => {
   result.current.toggleUrgency();
  });

  expect(result.current.level).toBe('normal');
  expect(result.current.surcharge).toBe(0);
 });

 it('should update settings', () => {
  const { result } = renderHook(() => useUrgencySettings(initialSettings));
  const newSettings: UrgencySettings = {
   level: 'urgent',
   surcharge: 1500,
   urgentSurcharge: 1500,
  };

  act(() => {
   result.current.updateSettings(newSettings);
  });

  expect(result.current.settings.urgentSurcharge).toBe(1500);
 });
});

import { renderHook, act } from '@testing-library/react';
import { useClientsUI } from '../use-clients-ui';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useClientsUI', () => {
  const setUiState = vi.fn();
  const setViewState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('addToHistory adds valid query to history and localStorage', () => {
    const { result } = renderHook(() => useClientsUI(setUiState, setViewState));

    act(() => {
      result.current.addToHistory('test query');
    });

    expect(setUiState).toHaveBeenCalled();
    const updater = setUiState.mock.calls[0][0];
    const prevState = { searchHistory: [] };
    const newState = updater(prevState);

    expect(newState.searchHistory).toContain('test query');
    expect(localStorage.getItem('client_search_history')).toContain('test query');
  });

  it('addToHistory ignores empty or short queries', () => {
    const { result } = renderHook(() => useClientsUI(setUiState, setViewState));

    act(() => {
      result.current.addToHistory('');
      result.current.addToHistory('a');
    });

    expect(setUiState).not.toHaveBeenCalled();
  });

  it('handleExportClick sets showExportDialog to true', () => {
    const { result } = renderHook(() => useClientsUI(setUiState, setViewState));

    act(() => {
      result.current.handleExportClick();
    });

    expect(setUiState).toHaveBeenCalled();
    const updater = setUiState.mock.calls[0][0];
    const newState = updater({});
    expect(newState.showExportDialog).toBe(true);
  });
});

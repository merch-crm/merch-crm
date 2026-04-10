import { useCallback, Dispatch, SetStateAction } from "react";
import { ClientUiState, ClientViewState } from "./use-clients-state";

export function useClientsUI(
  setUiState: Dispatch<SetStateAction<ClientUiState>>,
  _setViewState: Dispatch<SetStateAction<ClientViewState>>
) {
  const addToHistory = useCallback((query: string) => {
    if (!query || query.length < 2) return;
    setUiState((prev) => {
      const newHistory = [query, ...prev.searchHistory.filter((h: string) => h !== query)].slice(0, 5);
      localStorage.setItem("client_search_history", JSON.stringify(newHistory));
      return { ...prev, searchHistory: newHistory };
    });
  }, [setUiState]);

  const handleExportClick = useCallback(() => {
    setUiState((prev) => ({ ...prev, showExportDialog: true }));
  }, [setUiState]);

  return {
    addToHistory,
    handleExportClick
  };
}

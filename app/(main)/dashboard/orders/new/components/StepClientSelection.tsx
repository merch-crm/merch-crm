"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/types";

interface StepClientSelectionProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchResults: Client[];
    selectedClient: Client | null;
    onSelectClient: (client: Client | null) => void;
    showHistory: boolean;
    searchHistory: string[];
    isSearching: boolean;
    userRoleName: string | null;
}

export function StepClientSelection({
    searchQuery,
    onSearchChange,
    searchResults,
    selectedClient,
    onSelectClient,
    showHistory,
    searchHistory,
    isSearching,
    userRoleName
}: StepClientSelectionProps) {
    return (
        <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-lg font-bold text-foreground">Выберите клиента</h4>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                    type="search"
                    placeholder="Поиск по имени, email или телефону..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-12"
                    aria-label="Поиск клиента"
                />
                {showHistory && searchHistory.length > 0 && !selectedClient && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="px-6 py-3 bg-muted border-b border-border flex justify-between items-center">
                            <span className="text-xs font-bold text-muted-foreground">Недавние поиски</span>
                        </div>
                        <div className="p-2">
                            {searchHistory.map((h, i) => (
                                <Button
                                    key={i}
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onSearchChange(h)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 transition-colors flex items-center gap-3 h-auto"
                                >
                                    <RotateCcw className="w-4 h-4 text-slate-300" />
                                    {h}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                {isSearching && (
                    <div className="absolute right-4 top-3.5">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent" />
                    </div>
                )}
            </div>

            {(searchResults || []).length > 0 && !selectedClient && (
                <div className="border border-border rounded-2xl shadow-xl bg-card overflow-hidden">
                    {(searchResults || []).map((client) => (
                        <Button
                            key={client.id}
                            type="button"
                            variant="ghost"
                            onClick={() => onSelectClient(client)}
                            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors rounded-none border-b border-border last:border-0 h-auto"
                        >
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold shrink-0">{(client.displayName || client.firstName || "?")?.charAt(0)}</div>
                            <div className="text-left min-w-0 flex-1">
                                <p className="font-bold text-foreground truncate">{client.displayName || "Без имени"}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {(client.company && typeof client.company === 'object' && 'name' in client.company ? client.company.name : String(client.company || "")) || ""} • {["Печатник", "Дизайнер"].includes(userRoleName || "") ? "HIDDEN" : (client.phone || "Нет телефона")}
                                </p>
                            </div>
                        </Button>
                    ))}
                </div>
            )}

            {selectedClient && (
                <div className="p-6 rounded-2xl bg-primary text-primary-foreground flex items-center justify-between shadow-lg shadow-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-xl ">{(selectedClient.displayName || "?").charAt(0)}</div>
                        <div>
                            <p className="font-bold">{selectedClient.displayName || "Unnamed Client"}</p>
                            <p className="text-xs text-primary-foreground/60">{
                                (selectedClient.company && typeof selectedClient.company === 'object' && 'name' in selectedClient.company)
                                    ? selectedClient.company.name
                                    : String(selectedClient.company || "Личный заказ")
                            }</p>
                        </div>
                    </div>
                    <Button type="button" variant="ghost" onClick={() => onSelectClient(null)} className="text-xs font-bold bg-white/10 hover:bg-white/20 hover:text-white px-4 py-2 rounded-2xl h-auto">Изменить</Button>
                </div>
            )}
        </div>
    );
}

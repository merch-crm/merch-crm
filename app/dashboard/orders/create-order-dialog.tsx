"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, ChevronRight, User, Check, Clock } from "lucide-react";
import { createOrder, getInventoryForSelect, searchClients } from "./actions";
import { cn } from "@/lib/utils";

export function CreateOrderDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [inventory, setInventory] = useState<any[]>([]);

    // Step 1: Client State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const [newClient, setNewClient] = useState({
        name: "",
        company: "",
        phone: "",
        city: "",
        email: ""
    });

    useEffect(() => {
        if (isOpen) {
            getInventoryForSelect().then(setInventory);
            setStep(1);
            setSelectedClient(null);
            setSearchQuery("");
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                const res = await searchClients(searchQuery);
                setSearchResults(res.data || []);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
            >
                <Plus className="w-5 h-5" />
                Создать заказ
            </button>
        );
    }

    const steps = [
        { id: 1, label: "Клиент" },
        { id: 2, label: "Изделие" },
        { id: 3, label: "Нанесение" },
        { id: 4, label: "Дизайн" },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

                <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-slate-100 flex flex-col min-h-[600px]">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 border-b border-slate-50 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Создать заказ</h3>
                                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Шаг {step} из 4</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-300 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Stepper */}
                        <div className="mt-10 mb-2">
                            <div className="flex items-center justify-between relative px-2">
                                {steps.map((s, idx) => (
                                    <div key={s.id} className="flex flex-col items-center relative z-10 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500",
                                            step >= s.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest mt-3 transition-colors duration-500",
                                            step >= s.id ? "text-indigo-600" : "text-slate-300"
                                        )}>
                                            {s.label}
                                        </span>
                                        {idx < steps.length - 1 && (
                                            <div className={cn(
                                                "absolute top-5 left-[50%] w-full h-[2px] -z-10 transition-colors duration-500",
                                                step > s.id ? "bg-indigo-600" : "bg-slate-100"
                                            )} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-10 py-8 overflow-y-auto max-h-[500px]">
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-4">Выберите клиента</h4>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Поиск клиента по имени, email, телефону или городу..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full rounded-2xl border-slate-200 bg-white pl-12 pr-4 py-4 text-sm font-medium placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                                        />
                                        {isSearching && (
                                            <div className="absolute right-4 top-4">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                                            </div>
                                        )}
                                    </div>

                                    {searchResults.length > 0 && !selectedClient && (
                                        <div className="mt-2 border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 bg-white overflow-hidden absolute z-20 w-[calc(100%-80px)]">
                                            {searchResults.map((client) => (
                                                <button
                                                    key={client.id}
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setSearchQuery("");
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                                        {client.name.charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-slate-900">{client.name}</p>
                                                        <p className="text-xs text-slate-500">{client.company} • {client.city}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {selectedClient && (
                                        <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-black text-lg">
                                                    {selectedClient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{selectedClient.name}</p>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedClient.company || "Личный заказ"}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedClient(null)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-3 py-1.5 rounded-lg shadow-sm"
                                            >
                                                Изменить
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-slate-50 pt-8">
                                    <h4 className="text-lg font-bold text-slate-900 mb-4">Или создать нового клиента</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Имя"
                                            value={newClient.name}
                                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                            className="rounded-xl border-slate-200 py-3 px-4 text-sm font-medium focus:border-indigo-500 focus:ring-indigo-50/50 transition-all"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Фамилия"
                                            className="rounded-xl border-slate-200 py-3 px-4 text-sm font-medium focus:border-indigo-500 focus:ring-indigo-50/50 transition-all"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Номер телефона"
                                            value={newClient.phone}
                                            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                            className="rounded-xl border-slate-200 py-3 px-4 text-sm font-medium focus:border-indigo-500 focus:ring-indigo-50/50 transition-all"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Город"
                                            value={newClient.city}
                                            onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                                            className="rounded-xl border-slate-200 py-3 px-4 text-sm font-medium focus:border-indigo-500 focus:ring-indigo-50/50 transition-all"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={newClient.email}
                                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                            className="col-span-2 rounded-xl border-slate-200 py-3 px-4 text-sm font-medium focus:border-indigo-500 focus:ring-indigo-50/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step > 1 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="w-8 h-8 text-slate-300" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900">Этот шаг находится в разработке</h4>
                                <p className="text-sm text-slate-500 mt-2">Пожалуйста, проверьте шаг 1 для примера UI.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-10 py-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={step === 1}
                            className={cn(
                                "flex items-center gap-2 text-sm font-bold transition-all",
                                step === 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-slate-900"
                            )}
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Назад
                        </button>

                        <div className="flex gap-4 items-center">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95"
                            >
                                {step === 4 ? "Создать" : "Далее"}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

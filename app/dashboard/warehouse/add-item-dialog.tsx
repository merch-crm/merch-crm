"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addInventoryItem } from "./actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
            {pending ? "Сохранение..." : "Добавить"}
        </button>
    );
}

export function AddItemDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    async function clientAction(formData: FormData) {
        const res = await addInventoryItem(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            setError("");
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Добавить товар
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={() => setIsOpen(false)} />

                <div className="relative transform overflow-hidden rounded-lg bg-slate-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-slate-700">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="rounded-md bg-slate-800 text-slate-400 hover:text-slate-300 focus:outline-none"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <h3 className="text-lg font-medium leading-6 text-white mb-4">
                        Новый товар
                    </h3>

                    <form action={clientAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">
                                Название
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                                placeholder="Футболка белая XL"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">
                                    Артикул (SKU)
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                                    placeholder="TSH-WH-XL"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">
                                    Ед. измерения
                                </label>
                                <select
                                    name="unit"
                                    className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                                >
                                    <option value="шт">шт (pcs)</option>
                                    <option value="м">метры</option>
                                    <option value="кг">кг</option>
                                    <option value="упак">упак</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">
                                    Начальное кол-во
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    defaultValue="0"
                                    min="0"
                                    required
                                    className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">
                                    Мин. остаток
                                </label>
                                <input
                                    type="number"
                                    name="lowStockThreshold"
                                    defaultValue="10"
                                    className="mt-1 block w-full rounded-md border-slate-600 bg-slate-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-400 text-sm">{error}</div>}

                        <div className="mt-5 sm:mt-6">
                            <SubmitButton />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

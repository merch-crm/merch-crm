"use client";

import { useState } from "react";
import { updateOrderStatus } from "../actions";

const statuses = [
    { id: "new", label: "Новый" },
    { id: "layout_pending", label: "Ждет макет" },
    { id: "layout_approved", label: "Макет ОК" },
    { id: "in_printing", label: "В печати" },
    { id: "done", label: "Готов" },
    { id: "cancelled", label: "Отменен" },
];

export default function StatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    const checkColors = (s: string) => {
        switch (s) {
            case "new": return "bg-blue-900 border-blue-700 text-blue-100";
            case "done": return "bg-emerald-900 border-emerald-700 text-emerald-100";
            case "cancelled": return "bg-red-900 border-red-700 text-red-100";
            default: return "bg-slate-800 border-slate-600 text-slate-100";
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setLoading(true);
        setStatus(newStatus);

        await updateOrderStatus(orderId, newStatus);
        setLoading(false);
    };

    return (
        <select
            value={status}
            onChange={handleChange}
            disabled={loading}
            className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border ${checkColors(status)}`}
        >
            {statuses.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-white">
                    {s.label}
                </option>
            ))}
        </select>
    );
}

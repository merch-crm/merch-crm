import { getInventoryItems } from "./actions";
import { Edit, Trash2, AlertTriangle } from "lucide-react";

export async function InventoryTable() {
    const { data: items, error } = await getInventoryItems();

    if (error || !items) {
        return <div className="text-red-400">Ошибка загрузки товаров</div>;
    }

    return (
        <div className="bg-card shadow-sm rounded-xl border border-border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Название / Артикул
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Количество
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Мин. остаток
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Действия
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                    {items.map((item) => {
                        const isLowStock = item.quantity <= item.lowStockThreshold;
                        return (
                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-foreground">
                                                {item.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{item.sku}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span
                                            className={`text-sm font-bold ${isLowStock ? "text-red-400" : "text-emerald-400"
                                                }`}
                                        >
                                            {item.quantity} {item.unit}
                                        </span>
                                        {isLowStock && (
                                            <AlertTriangle className="w-4 h-4 text-amber-500 ml-2" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {item.lowStockThreshold} {item.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-400 hover:text-indigo-300 mr-4">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    {/* Destructive actions should ideally use a form/action */}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {items.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    Склад пуст. Добавьте первые товары.
                </div>
            )}
        </div>
    );
}

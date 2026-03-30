import { getPortalData } from "./actions";
import { PortalClient } from "./portal-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Мой Портал | MerchCRM",
    description: "Личный кабинет сотрудника производства",
};

export default async function PortalPage() {
    const res = await getPortalData();
    
    if (!res.success) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-rose-50 border border-rose-200 p-8 rounded-[32px] text-center max-w-md">
                    <h1 className="text-2xl font-bold text-rose-900 mb-2">Ошибка доступа</h1>
                    <p className="text-rose-700 mb-6">{res.error || "У вас нет прав для просмотра этой страницы"}</p>
                    <a href="/dashboard" className="btn-dark px-6 py-2 rounded-xl">Вернуться</a>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-0">
            <PortalClient data={res.data} />
        </div>
    );
}

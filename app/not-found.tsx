"use client";

import { FileSearch, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
            <div className="max-w-[360px] w-full bg-white rounded-[2rem] shadow-crm-xl border border-slate-100/50 overflow-hidden text-center p-8 space-y-4 animate-in zoom-in-95 duration-700">

                {/* Icon Container */}
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 mx-auto border border-sky-100/50 shadow-sm">
                    <FileSearch className="w-8 h-8 stroke-[2.5]" />
                </div>

                {/* Text Section */}
                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">
                        Страница не найдена
                    </h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
                        К сожалению, запрашиваемая страница не существует или была перемещена.
                    </p>
                </div>

                {/* Buttons Section */}
                <div className="flex flex-col gap-2.5">
                    <Button
                        onClick={() => router.back()}
                        className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-[14px] font-bold text-xs shadow-lg shadow-slate-200 transition-all active:scale-[0.98] w-full flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Вернуться назад
                    </Button>

                    <Link href="/dashboard" className="block w-full">
                        <Button
                            variant="ghost"
                            className="h-11 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-[14px] font-bold text-xs w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Home className="w-3.5 h-3.5" />
                            На главную
                        </Button>
                    </Link>
                </div>

                {/* Footer Section */}
                <div className="pt-5 border-t border-slate-50">
                    <p className="text-xs font-black text-slate-300 leading-none">
                        Error 404
                    </p>
                </div>
            </div>
        </div>
    );
}

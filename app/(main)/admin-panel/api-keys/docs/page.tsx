"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Terminal, Key, Globe, 
    ChevronLeft, Copy, Check, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ApiDocsPage() {
    const [copied, setCopied] = useState<string | null>(null);

    const baseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "http://localhost:3000";

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success("Скопировано в буфер обмена");
        setTimeout(() => setCopied(null), 2000);
    };

    const endpoints = [
        {
            method: "GET",
            path: "/api/v1/ping",
            description: "Проверка работоспособности API и авторизации.",
            auth: true
        },
        {
            method: "GET",
            path: "/api/v1/orders",
            description: "Получение списка заказов с фильтрацией (в разработке).",
            auth: true,
            params: [
                { name: "status", type: "string", description: "Фильтр по статусу (new, design, production, ready, delivered, cancelled)" },
                { name: "limit", type: "number", description: "Лимит записей (по умолчанию 20)" }
            ]
        }
    ];

    return (
        <div className="space-y-3 pb-20">
            <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" size="icon" asChild className="rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <Link href="/admin-panel/api-keys">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Документация API v1.0</h1>
                    <p className="text-slate-500 text-xs font-bold mt-0.5">Публичный интерфейс для интеграций</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Left Side: Auth & Base Info */}
                <div className="lg:col-span-1 space-y-3">
                    <div className="crm-card p-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                                <Key className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Авторизация</h2>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Все запросы к API должны содержать заголовок <code className="bg-slate-100 px-1.5 py-0.5 rounded text-primary font-bold">X-API-KEY</code>.
                        </p>
                        <div className="p-4 bg-slate-900 rounded-2xl relative group">
                            <pre className="text-xs text-blue-300 font-mono">
                                {`X-API-KEY: m_crm_xxx...`}
                            </pre>
                            <button 
                                type="button"
                                onClick={() => copyToClipboard("X-API-KEY: your_key_here", "auth-header")}
                                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                                {copied === "auth-header" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>

                    <div className="crm-card p-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 text-blue-500">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Base URL</h2>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <code className="text-xs font-bold text-slate-700">{baseUrl}/api/v1</code>
                            <button type="button" onClick={() => copyToClipboard(`${baseUrl}/api/v1`, "base-url")} className="text-slate-400 hover:text-primary transition-colors">
                                {copied === "base-url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-black text-amber-900">Безопасность</p>
                            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                Никогда не передавайте API ключи в клиентском коде на стороне браузера. Используйте серверные интеграции.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Endpoints */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="crm-card overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-500">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-black text-slate-900">Конечные точки (Endpoints)</h2>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {endpoints.map((endpoint, idx) => (
                                <div key={idx} className="p-8 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-black h-8 px-3 text-xs">
                                                {endpoint.method}
                                            </Badge>
                                            <code className="text-base font-black text-slate-900">{endpoint.path}</code>
                                        </div>
                                        {endpoint.auth && (
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0.5 rounded-lg">
                                                Auth Required
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">{endpoint.description}</p>
                                    
                                    {endpoint.params && (
                                        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
                                            <p className="text-xs font-black text-slate-400 mb-3">Параметры запроса</p>
                                            <div className="space-y-2">
                                                {endpoint.params.map((p, pIdx) => (
                                                    <div key={pIdx} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
                                                        <div>
                                                            <span className="text-xs font-black text-slate-900">{p.name}</span>
                                                            <span className="text-xs text-slate-400 ml-2">({p.type})</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{p.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-400 px-2">Пример Curl</p>
                                        </div>
                                        <div className="bg-slate-900 rounded-2xl p-4 relative group/code shadow-lg shadow-slate-200/50">
                                            <pre className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
                                                {`curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "X-API-KEY: YOUR_API_KEY"`}
                                            </pre>
                                            <button 
                                                type="button"
                                                onClick={() => copyToClipboard(`curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" -H "X-API-KEY: YOUR_API_KEY"`, `curl-${idx}`)}
                                                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all opacity-0 group-hover/code:opacity-100"
                                            >
                                                {copied === `curl-${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

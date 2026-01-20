"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Upload, Palette, Database } from "lucide-react";
import { updateBrandingSettings } from "./actions";
import { useRouter } from "next/navigation";

interface BrandingFormProps {
    initialSettings: {
        companyName: string;
        logoUrl: string | null;
        primaryColor: string;
        primary_color?: string;
        faviconUrl: string | null;
        radius_outer?: number;
        radius_inner?: number;
    };
}

export function BrandingForm({ initialSettings }: BrandingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialSettings);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateBrandingSettings(formData);

        if (result.error) {
            alert(result.error);
        } else {
            alert("Настройки сохранены! Обновите страницу для применения изменений.");
            router.refresh();
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Название компании</h3>
                <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="MerchCRM"
                    className="max-w-md"
                />
                <p className="text-xs text-slate-400 mt-2">Отображается в header и других местах системы</p>
            </div>

            {/* Accent Color */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    Акцентный цвет (Бренд)
                </h3>
                <div className="flex items-center gap-4">
                    <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-20 h-12 rounded-[12px] border-2 border-slate-200 cursor-pointer"
                    />
                    <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        placeholder="#5d00ff"
                        className="max-w-xs"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2">Используется для кнопок, акцентов и активных элементов</p>
            </div>

            {/* Border Radius */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Закругление углов (Radius)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700">Внешний радиус (Панели)</label>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{formData.radius_outer || 24}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="40"
                            value={formData.radius_outer || 24}
                            onChange={(e) => setFormData({ ...formData, radius_outer: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700">Внутренний радиус (Кнопки/Инпуты)</label>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{formData.radius_inner || 14}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="30"
                            value={formData.radius_inner || 14}
                            onChange={(e) => setFormData({ ...formData, radius_inner: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">Настройте мягкость интерфейса. Большие значения делают дизайн более современным и &quot;круглым&quot;.</p>
            </div>

            {/* Logo URL */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    Логотип
                </h3>
                <Input
                    value={formData.logoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value || null })}
                    placeholder="https://example.com/logo.png"
                    className="max-w-md"
                />
                <p className="text-xs text-slate-400 mt-2">URL изображения логотипа (PNG, SVG). Оставьте пустым для иконки по умолчанию.</p>
                {formData.logoUrl && (
                    <div className="mt-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.logoUrl} alt="Logo preview" className="h-12 rounded-[12px] border border-slate-200 p-2 bg-white" />
                    </div>
                )}
            </div>

            {/* Favicon URL */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Favicon</h3>
                <Input
                    value={formData.faviconUrl || ""}
                    onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value || null })}
                    placeholder="https://example.com/favicon.ico"
                    className="max-w-md"
                />
                <p className="text-xs text-slate-400 mt-2">URL иконки для вкладки браузера (ICO, PNG 32x32)</p>
            </div>



            {/* Submit */}
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="gap-2 h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200">
                    <Save className="w-5 h-5" />
                    {loading ? "Сохранение..." : "Сохранить настройки темы"}
                </Button>
            </div>
        </form>
    );
}

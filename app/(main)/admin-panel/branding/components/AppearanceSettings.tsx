import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Loader2, Upload, X, MousePointer2, Eye, EyeOff, Moon, Sun, Image as LucideImage } from "lucide-react";
import { BrandingSettings, BrandingUiState } from "../hooks/useBrandingForm";
import { IconManager } from "../icon-manager";
import { SerializedIconGroup } from "@/app/(main)/dashboard/warehouse/category-utils";

interface AppearanceSettingsProps {
    formData: BrandingSettings;
    setFormData: React.Dispatch<React.SetStateAction<BrandingSettings>>;
    ui: BrandingUiState;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon" | "background" | "print_logo" | "sound" | "crm_background" | "email_logo", soundKey?: string) => Promise<void>;
    initialIconGroups: SerializedIconGroup[];
}

export function AppearanceSettings({ formData, setFormData, ui, handleFileUpload, initialIconGroups }: AppearanceSettingsProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Color & Background Settings Block */}
                <div className="crm-card p-6 space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <ColorPicker
                                    label="Фирменный цвет"
                                    color={formData.primaryColor}
                                    onChange={(newColor) => setFormData(prev => ({ ...prev, primaryColor: newColor }))}
                                />
                                <p className="text-xs text-slate-400 mt-2">Кнопки, активные состояния, иконки</p>
                            </div>

                            <div>
                                <ColorPicker
                                    label="Фоновый цвет CRM"
                                    color={formData.backgroundColor || "#f2f2f2"}
                                    onChange={(newColor) => setFormData(prev => ({ ...prev, backgroundColor: newColor }))}
                                />
                                <p className="text-xs text-slate-400 mt-2">Основной фон страниц</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Фоновое изображение CRM
                            </label>

                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 border-dashed">
                                <div className="relative group shrink-0">
                                    {formData.crmBackgroundUrl ? (
                                        <div className="relative">
                                            <Image
                                                src={formData.crmBackgroundUrl}
                                                alt="CRM Background"
                                                className="h-20 w-32 object-cover rounded-[18px] border border-slate-200 p-1 bg-white"
                                                width={128}
                                                height={80}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setFormData(prev => ({ ...prev, crmBackgroundUrl: null }))}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-600 hover:text-white p-0"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="h-20 w-32 rounded-[18px] border-2 border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-300">
                                            <LucideImage className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="crm-bg-u"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, "crm_background")}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full rounded-[20px] font-bold h-10 border-slate-200"
                                        disabled={ui.uploads.crmBg}
                                        onClick={() => document.getElementById("crm-bg-u")?.click()}
                                    >
                                        {ui.uploads.crmBg ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Загрузить фон
                                    </Button>
                                    <p className="text-xs text-slate-400 mt-2 text-center">Рекомендуется: 1920x1080px</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-slate-700">
                                                Скругление (внешнее)
                                            </label>
                                            <span className="text-xs font-bold" style={{ color: formData.primaryColor }}>{formData.radiusOuter || 24}px</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MousePointer2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <input
                                                type="range"
                                                min="0"
                                                max="40"
                                                step="1"
                                                value={formData.radiusOuter || 24}
                                                onChange={(e) => setFormData(prev => ({ ...prev, radiusOuter: Number(e.target.value) }))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all hover:bg-slate-300"
                                                style={{ accentColor: formData.primaryColor }}
                                            />
                                            <span className="text-xs text-slate-400 w-8 text-right">40px</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-slate-700">
                                                Скругление (внутреннее)
                                            </label>
                                            <span className="text-xs font-bold" style={{ color: formData.primaryColor }}>{formData.radiusInner || 14}px</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MousePointer2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <input
                                                type="range"
                                                min="0"
                                                max="40"
                                                step="1"
                                                value={formData.radiusInner || 14}
                                                onChange={(e) => setFormData(prev => ({ ...prev, radiusInner: Number(e.target.value) }))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all hover:bg-slate-300"
                                                style={{ accentColor: formData.primaryColor }}
                                            />
                                            <span className="text-xs text-slate-400 w-8 text-right">40px</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-slate-700">
                                                Размытие фона CRM
                                            </label>
                                            <span className="text-xs font-bold" style={{ color: formData.primaryColor }}>{formData.crmBackgroundBlur || 0}px</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <input
                                                type="range"
                                                min="0"
                                                max="40"
                                                step="1"
                                                value={formData.crmBackgroundBlur || 0}
                                                onChange={(e) => setFormData(prev => ({ ...prev, crmBackgroundBlur: Number(e.target.value) }))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all hover:bg-slate-300"
                                                style={{ accentColor: formData.primaryColor }}
                                            />
                                            <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-slate-700">
                                                Яркость фона CRM
                                            </label>
                                            <span className="text-xs font-bold" style={{ color: formData.primaryColor }}>{formData.crmBackgroundBrightness || 100}%</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Moon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <input
                                                type="range"
                                                min="20"
                                                max="180"
                                                step="1"
                                                value={formData.crmBackgroundBrightness || 100}
                                                onChange={(e) => setFormData(prev => ({ ...prev, crmBackgroundBrightness: Number(e.target.value) }))}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all hover:bg-slate-300"
                                                style={{ accentColor: formData.primaryColor }}
                                            />
                                            <Sun className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Login Page Background */}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Фон страницы входа
                            </label>
                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 border-dashed">
                                <div className="relative group shrink-0">
                                    {formData.loginBackgroundUrl ? (
                                        <div className="relative">
                                            <Image
                                                src={formData.loginBackgroundUrl}
                                                alt="Login Background"
                                                className="h-20 w-32 object-cover rounded-[18px] border border-slate-200 p-1 bg-white"
                                                width={128}
                                                height={80}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setFormData(prev => ({ ...prev, loginBackgroundUrl: null }))}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-600 hover:text-white p-0"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="h-20 w-32 rounded-[18px] border-2 border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-300">
                                            <LucideImage className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="bg-u"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, "background")}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full rounded-[20px] font-bold h-10 border-slate-200"
                                        disabled={ui.uploads.background}
                                        onClick={() => document.getElementById("bg-u")?.click()}
                                    >
                                        {ui.uploads.background ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Выбрать фон
                                    </Button>
                                    <p className="text-xs text-slate-400 mt-2 text-center">Рекомендуется: 1920x1080px</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand Assets Block */}
                <div className="crm-card p-6 space-y-4">
                    <div className="space-y-4">
                        {/* Logo */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Логотип системы
                            </label>
                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 border-dashed">
                                <div className="relative group">
                                    {formData.logoUrl ? (
                                        <div className="relative">
                                            <Image
                                                src={formData.logoUrl}
                                                alt="Logo"
                                                className="h-14 w-auto min-w-[56px] object-contain"
                                                width={200}
                                                height={56}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, logoUrl: null }))} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-600 hover:text-white p-0"><X className="w-3 h-3" /></Button>
                                        </div>
                                    ) : <div className="h-14 w-14 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-300"><LucideImage className="w-6 h-6" /></div>}
                                </div>
                                <div className="flex-1">
                                    <input type="file" id="logo-u" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} />
                                    <Button type="button" variant="outline" className="w-full h-11 px-4 bg-white font-bold rounded-xl border-slate-200" onClick={() => document.getElementById("logo-u")?.click()} disabled={ui.uploads.logo}>
                                        {ui.uploads.logo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} {formData.logoUrl ? "Заменить" : "Загрузить лого"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Favicon */}
                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Иконка вкладки (Favicon)
                            </label>
                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 border-dashed">
                                <div className="relative group">
                                    {formData.faviconUrl ? (
                                        <div className="relative">
                                            <Image
                                                src={formData.faviconUrl}
                                                alt="Favicon"
                                                className="w-12 h-12 object-contain"
                                                width={48}
                                                height={48}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, faviconUrl: null }))} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-600 hover:text-white p-0"><X className="w-3 h-3" /></Button>
                                        </div>
                                    ) : <div className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-300"><LucideImage className="w-5 h-5" /></div>}
                                </div>
                                <div className="flex-1">
                                    <input type="file" id="fav-u" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "favicon")} />
                                    <Button type="button" variant="outline" className="w-full h-11 px-4 bg-white font-bold rounded-xl border-slate-200" onClick={() => document.getElementById("fav-u")?.click()} disabled={ui.uploads.favicon}>
                                        {ui.uploads.favicon ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} {formData.faviconUrl ? "Заменить" : "Загрузить иконку"}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 pl-1">Рекомендуется: 32x32px или 64x64px</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Icon Manager nested here */}
            <div className="pt-4">
                <IconManager initialData={initialIconGroups} />
            </div>
        </div>
    );
}

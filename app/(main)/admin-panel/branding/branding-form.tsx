"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Upload, Palette, Database, Building2, Image as LucideImage, Loader2, X, Monitor, Share2, Printer, Volume2, MessageCircle, CheckCircle2, AlertCircle, RefreshCw, ShoppingBag, Users, Warehouse, Banknote, ListTodo, Cpu, ScanLine, Stars, MousePointer2, VolumeX, Mail, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { updateBrandingSettings, uploadBrandingFile } from "./actions";
import { useRouter } from "next/navigation";
import { IconManager } from "./icon-manager";
import { SerializedIconGroup } from "@/app/(main)/dashboard/warehouse/category-utils";
import { ColorPicker } from "@/components/ui/color-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SOUND_CATEGORIES, playSound, setGlobalSoundConfig, SoundType } from "@/lib/sounds";
import { PremiumSelect, PremiumSelectOption } from "@/components/ui/premium-select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface BrandingFormProps {
    initialSettings: {
        companyName: string;
        logoUrl: string | null;
        primaryColor: string;
        faviconUrl: string | null;
        radiusOuter?: number;
        radiusInner?: number;
        loginSlogan?: string | null;
        loginBackgroundUrl?: string | null;
        dashboardWelcome?: string | null;
        socialTelegram?: string | null;
        socialWhatsapp?: string | null;
        socialWebsite?: string | null;
        notificationSound?: string | null;
        vibrationEnabled?: boolean;
        printLogoUrl?: string | null;
        soundConfig?: Record<string, { enabled: boolean; vibration: boolean; customUrl?: string | null }>;
        backgroundColor?: string | null;
        crmBackgroundUrl?: string | null;
        crmBackgroundBlur?: number;
        crmBackgroundBrightness?: number;
        emailLogoUrl?: string | null;
        emailPrimaryColor?: string;
        emailContrastColor?: string;
        emailFooter?: string | null;
        emailSignature?: string | null;
        currencySymbol?: string;
        dateFormat?: string;
        timezone?: string;
    };
    initialIconGroups: SerializedIconGroup[];
}

export function BrandingForm({ initialSettings, initialIconGroups }: BrandingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);
    const [uploadingBg, setUploadingBg] = useState(false);
    const [uploadingPrintLogo, setUploadingPrintLogo] = useState(false);
    const [uploadingEmailLogo, setUploadingEmailLogo] = useState(false);

    const [uploadingCrmBg, setUploadingCrmBg] = useState(false);
    const [formData, setFormData] = useState<BrandingFormProps['initialSettings']>(initialSettings);
    const [activeMainTab, setActiveMainTab] = useState("main");
    const [activeSoundTab, setActiveSoundTab] = useState<string>("notifications");

    const timezoneOptions: PremiumSelectOption[] = [
        { id: "Europe/Kaliningrad", title: "Калининград (UTC+2)" },
        { id: "Europe/Moscow", title: "Москва (UTC+3)" },
        { id: "Europe/Samara", title: "Самара (UTC+4)" },
        { id: "Asia/Yekaterinburg", title: "Екатеринбург (UTC+5)" },
        { id: "Asia/Omsk", title: "Омск (UTC+6)" },
        { id: "Asia/Novosibirsk", title: "Новосибирск (UTC+7)" },
        { id: "Asia/Irkutsk", title: "Иркутск (UTC+8)" },
        { id: "Asia/Yakutsk", title: "Якутск (UTC+9)" },
        { id: "Asia/Vladivostok", title: "Владивосток (UTC+10)" },
        { id: "Asia/Magadan", title: "Магадан (UTC+11)" },
        { id: "Asia/Kamchatka", title: "Камчатка (UTC+12)" },
    ];


    // Sync sound config to global state for preview
    useEffect(() => {
        if (formData.soundConfig) {
            setGlobalSoundConfig(formData.soundConfig);
        }
    }, [formData.soundConfig]);

    // Custom modal state
    const [modal, setModal] = useState<{
        open: boolean;
        type: "success" | "error";
        title: string;
        message: string;
        showRefresh?: boolean;
    }>({ open: false, type: "success", title: "", message: "" });

    const showModal = (type: "success" | "error", title: string, message: string, showRefresh = false) => {
        setModal({ open: true, type, title, message, showRefresh });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, open: false }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await updateBrandingSettings(formData);

        if (result.error) {
            showModal("error", "Ошибка", result.error);
            playSound("notification_error");
        } else {
            showModal("success", "Успешно", "Настройки сохранены! Обновите страницу для применения изменений.", true);
            playSound("notification_success");
            router.refresh();
        }

        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon" | "background" | "print_logo" | "sound" | "crm_background" | "email_logo", soundKey?: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === "logo") setUploadingLogo(true);
        else if (type === "favicon") setUploadingFavicon(true);
        else if (type === "background") setUploadingBg(true);
        else if (type === "print_logo") setUploadingPrintLogo(true);
        else if (type === "crm_background") setUploadingCrmBg(true);
        else if (type === "email_logo") setUploadingEmailLogo(true);


        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("type", type);
        if (soundKey) uploadData.append("soundKey", soundKey);

        try {
            const result = await uploadBrandingFile(uploadData);
            if (result.success && result.url) {
                const urlWithVersion = `${result.url}?v=${Date.now()}`;

                if (type === "sound" && soundKey) {
                    // Update specific sound config
                    const newConfig = { ...formData.soundConfig };
                    const current = newConfig[soundKey] || { enabled: true, vibration: true };
                    newConfig[soundKey] = { ...current, customUrl: urlWithVersion };
                    setFormData(prev => ({
                        ...prev,
                        soundConfig: newConfig
                    }));
                } else {
                    const keyMap: Record<string, string> = {
                        logo: "logoUrl",
                        favicon: "faviconUrl",
                        background: "loginBackgroundUrl",
                        print_logo: "printLogoUrl",
                        crm_background: "crmBackgroundUrl",
                        email_logo: "emailLogoUrl",
                        sound: "notificationSound" // Fallback if no key provided
                    };
                    const field = keyMap[type];
                    setFormData(prev => ({
                        ...prev,
                        [field]: urlWithVersion
                    }));
                }
                playSound("notification_success");
            } else if (result.error) {
                showModal("error", "Ошибка загрузки", result.error);
                playSound("notification_error");
            }
        } catch (error) {
            console.error("Upload error:", error);
            showModal("error", "Ошибка", "Ошибка при загрузке файла");
            playSound("notification_error");
        } finally {
            if (type === "logo") setUploadingLogo(false);
            else if (type === "favicon") setUploadingFavicon(false);
            else if (type === "background") setUploadingBg(false);
            else if (type === "print_logo") setUploadingPrintLogo(false);
            else if (type === "crm_background") setUploadingCrmBg(false);
            else if (type === "email_logo") setUploadingEmailLogo(false);

            // Reset input
            e.target.value = "";
        }
    };

    // No early return to avoid hook count mismatches in complex hydration scenarios
    // Use hasMounted sparingly inside the return if needed for specific values

    return (
        <div className="space-y-5 pb-20">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header with Save Button */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center border border-primary/10">
                            <Palette className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">Внешний вид</h1>
                            <p className="text-slate-500 text-[11px] font-medium mt-0.5">Настройка логотипа, цветов, звуков и интерфейса CRM</p>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        variant="btn-dark"
                        className="h-12 rounded-[18px] px-8 gap-2 font-bold shadow-lg shadow-black/10 hover:shadow-black/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? <Database className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {loading ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                </div>

                {/* Tabs for different sections */}
                <Tabs defaultValue="main" value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-5">
                    <TabsList className="flex w-full h-[58px] items-center gap-2 !p-[6px] !rounded-2xl crm-card bg-white/50 border border-slate-200/60 transition-all overflow-x-auto no-scrollbar">
                        {[
                            { id: "main", label: "Основные характеристики", icon: Building2 },
                            { id: "ui", label: "Внешний вид", icon: Monitor },
                            { id: "sounds", label: "Звуки", icon: Volume2 },
                            { id: "comms", label: "Внешний вид & Связь", icon: Share2 }
                        ].map((tab) => {
                            const isActive = activeMainTab === tab.id;
                            return (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={cn(
                                        "flex-1 h-full relative flex items-center justify-center gap-2.5 px-6 !rounded-[16px] text-[13px] font-bold transition-all border-none data-[state=active]:bg-transparent data-[state=active]:!text-white data-[state=active]:shadow-none text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeBrandingTab"
                                                className="absolute inset-0 bg-primary !rounded-[16px] shadow-lg shadow-primary/25 z-0"
                                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                    <div className="relative z-10 flex items-center gap-2.5">
                                        <tab.icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </div>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    <TabsContent value="main" className="space-y-5">
                        {/* General & Branding Text Settings Combined */}
                        <div className="crm-card p-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                            Название компании
                                        </label>
                                        <Input
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            placeholder="MerchCRM"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                            Слоган (Slogan)
                                        </label>
                                        <Input
                                            value={formData.loginSlogan || ""}
                                            onChange={(e) => setFormData({ ...formData, loginSlogan: e.target.value })}
                                            placeholder="Ваша CRM для управления мерчем"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                            Текст приветствия
                                        </label>
                                        <Input
                                            value={formData.dashboardWelcome || ""}
                                            onChange={(e) => setFormData({ ...formData, dashboardWelcome: e.target.value })}
                                            placeholder="Добро пожаловать в систему управления"
                                            className="h-11 rounded-xl"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">Отображается на главной странице после входа</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regional Settings Block */}
                        <div className="crm-card p-5 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                        Валюта системы
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {["₽", "$", "€", "₴", "₸"].map((sym) => (
                                            <Button
                                                key={sym}
                                                type="button"
                                                variant="outline"
                                                onClick={() => setFormData({ ...formData, currencySymbol: sym })}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl font-bold text-sm transition-all p-0",
                                                    formData.currencySymbol === sym
                                                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-primary hover:text-white"
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                                                )}
                                            >
                                                {sym}
                                            </Button>
                                        ))}
                                        <Input
                                            value={formData.currencySymbol || ""}
                                            onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                                            placeholder="Свой..."
                                            className="h-10 w-24 rounded-xl text-center font-bold"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400">Символ валюты для финансовых расчетов</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                        Формат даты
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {["DD.MM.YYYY", "YYYY-MM-DD", "MM/DD/YYYY"].map((fmt) => (
                                            <Button
                                                key={fmt}
                                                type="button"
                                                variant="outline"
                                                onClick={() => setFormData({ ...formData, dateFormat: fmt })}
                                                className={cn(
                                                    "px-3 h-10 rounded-xl font-bold text-[11px] transition-all",
                                                    formData.dateFormat === fmt
                                                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-primary hover:text-white"
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                                                )}
                                            >
                                                {fmt}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400">Глобальный формат отображения календаря</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                        Часовой пояс
                                    </label>
                                    <PremiumSelect
                                        options={timezoneOptions}
                                        value={formData.timezone || "Europe/Moscow"}
                                        onChange={(val) => setFormData({ ...formData, timezone: val })}
                                        placeholder="Выберите часовой пояс"
                                        className="w-full"
                                        compact
                                    />
                                    <p className="text-[10px] text-slate-400">Часовой пояс для логов и уведомлений</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>



                    <TabsContent value="ui">
                        <div className="space-y-6">

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Color & Background Settings Block (Moved) */}
                                <div className="crm-card p-5 space-y-6">

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <ColorPicker
                                                    label="Фирменный цвет"
                                                    color={formData.primaryColor}
                                                    onChange={(newColor) => setFormData({ ...formData, primaryColor: newColor })}
                                                />
                                                <p className="text-[10px] text-slate-400 mt-2">Кнопки, активные состояния, иконки</p>
                                            </div>

                                            <div>
                                                <ColorPicker
                                                    label="Фоновый цвет CRM"
                                                    color={formData.backgroundColor || "#f2f2f2"}
                                                    onChange={(newColor) => setFormData({ ...formData, backgroundColor: newColor })}
                                                />
                                                <p className="text-[10px] text-slate-400 mt-2">Основной фон страниц</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 space-y-5">
                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                Фоновое изображение CRM
                                            </label>

                                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 border-dashed">
                                                <div className="relative group shrink-0">
                                                    {formData.crmBackgroundUrl ? (
                                                        <div className="relative">
                                                            <img
                                                                src={formData.crmBackgroundUrl}
                                                                alt="CRM Background"
                                                                className="h-20 w-32 object-cover rounded-[18px] border border-slate-200 p-1 bg-white"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setFormData({ ...formData, crmBackgroundUrl: null })}
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
                                                        disabled={uploadingCrmBg}
                                                        onClick={() => document.getElementById("crm-bg-u")?.click()}
                                                    >
                                                        {uploadingCrmBg ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                        Загрузить фон
                                                    </Button>
                                                    <p className="text-[10px] text-slate-400 mt-2 text-center">Рекомендуется: 1920x1080px</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6 pt-4 border-t border-slate-100">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                                                Скругление (внешнее)
                                                            </label>
                                                            <span className="text-[11px] font-bold" style={{ color: formData.primaryColor }}>{formData.radiusOuter || 24}px</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <MousePointer2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="40"
                                                                step="1"
                                                                value={formData.radiusOuter || 24}
                                                                onChange={(e) => setFormData({ ...formData, radiusOuter: Number(e.target.value) })}
                                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all hover:bg-slate-300"
                                                                style={{ accentColor: formData.primaryColor }}
                                                            />
                                                            <span className="text-[10px] text-slate-400 w-8 text-right">40px</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                                                Скругление (внутреннее)
                                                            </label>
                                                            <span className="text-[11px] font-bold" style={{ color: formData.primaryColor }}>{formData.radiusInner || 14}px</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <MousePointer2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="40"
                                                                step="1"
                                                                value={formData.radiusInner || 14}
                                                                onChange={(e) => setFormData({ ...formData, radiusInner: Number(e.target.value) })}
                                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all hover:bg-slate-300"
                                                                style={{ accentColor: formData.primaryColor }}
                                                            />
                                                            <span className="text-[10px] text-slate-400 w-8 text-right">40px</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                                                Размытие фона CRM
                                                            </label>
                                                            <span className="text-[11px] font-bold" style={{ color: formData.primaryColor }}>{formData.crmBackgroundBlur || 0}px</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="40"
                                                                step="1"
                                                                value={formData.crmBackgroundBlur || 0}
                                                                onChange={(e) => setFormData({ ...formData, crmBackgroundBlur: Number(e.target.value) })}
                                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all hover:bg-slate-300"
                                                                style={{ accentColor: formData.primaryColor }}
                                                            />
                                                            <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                                                Яркость фона CRM
                                                            </label>
                                                            <span className="text-[11px] font-bold" style={{ color: formData.primaryColor }}>{formData.crmBackgroundBrightness || 100}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Moon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <input
                                                                type="range"
                                                                min="20"
                                                                max="180"
                                                                step="1"
                                                                value={formData.crmBackgroundBrightness || 100}
                                                                onChange={(e) => setFormData({ ...formData, crmBackgroundBrightness: Number(e.target.value) })}
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
                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                Фон страницы входа
                                            </label>
                                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 border-dashed">
                                                <div className="relative group shrink-0">
                                                    {formData.loginBackgroundUrl ? (
                                                        <div className="relative">
                                                            <img
                                                                src={formData.loginBackgroundUrl}
                                                                alt="Login Background"
                                                                className="h-20 w-32 object-cover rounded-[18px] border border-slate-200 p-1 bg-white"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setFormData({ ...formData, loginBackgroundUrl: null })}
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
                                                        disabled={uploadingBg}
                                                        onClick={() => document.getElementById("bg-u")?.click()}
                                                    >
                                                        {uploadingBg ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                        Выбрать фон
                                                    </Button>
                                                    <p className="text-[10px] text-slate-400 mt-2 text-center">Рекомендуется: 1920x1080px</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Brand Assets Block (Moved) */}
                                <div className="crm-card p-5 space-y-6">

                                    <div className="space-y-6">
                                        {/* Logo */}
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                Логотип системы
                                            </label>
                                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 border-dashed">
                                                <div className="relative group">
                                                    {formData.logoUrl ? (
                                                        <div className="relative">
                                                            <img src={formData.logoUrl} alt="Logo" className="h-14 w-auto min-w-[56px] object-contain" />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => setFormData({ ...formData, logoUrl: null })} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-600 hover:text-white p-0"><X className="w-3 h-3" /></Button>
                                                        </div>
                                                    ) : <div className="h-14 w-14 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-300"><LucideImage className="w-6 h-6" /></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <input type="file" id="logo-u" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} />
                                                    <Button type="button" variant="outline" className="w-full h-11 px-4 bg-white font-bold rounded-xl border-slate-200" onClick={() => document.getElementById("logo-u")?.click()} disabled={uploadingLogo}>
                                                        {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} {formData.logoUrl ? "Заменить" : "Загрузить лого"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Favicon */}
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                Иконка вкладки (Favicon)
                                            </label>
                                            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 border-dashed">
                                                <div className="relative group">
                                                    {formData.faviconUrl ? (
                                                        <div className="relative">
                                                            <img src={formData.faviconUrl} alt="Favicon" className="w-12 h-12 object-contain" />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => setFormData({ ...formData, faviconUrl: null })} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-600 hover:text-white p-0"><X className="w-3 h-3" /></Button>
                                                        </div>
                                                    ) : <div className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-300"><LucideImage className="w-5 h-5" /></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <input type="file" id="fav-u" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "favicon")} />
                                                    <Button type="button" variant="outline" className="w-full h-11 px-4 bg-white font-bold rounded-xl border-slate-200" onClick={() => document.getElementById("fav-u")?.click()} disabled={uploadingFavicon}>
                                                        {uploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} {formData.faviconUrl ? "Заменить" : "Загрузить иконку"}
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2 pl-1">Рекомендуется: 32x32px или 64x64px</p>
                                        </div>
                                    </div>
                                </div>


                            </div>




                            {/* Icon Manager nested here */}
                            <div className="pt-4">
                                <IconManager initialData={initialIconGroups} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="comms">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="crm-card p-5 space-y-6">

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                Логотип для писем (PNG/JPG)
                                            </label>
                                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed flex items-center gap-4">
                                                <div className="w-20 h-12 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center">
                                                    {formData.emailLogoUrl ? <img src={formData.emailLogoUrl} className="max-w-full max-h-full object-contain" alt="Email Logo" /> : <Mail className="w-6 h-6 text-slate-200" />}
                                                </div>
                                                <div className="flex-1">
                                                    <input type="file" id="email-l-u" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "email_logo")} />
                                                    <Button type="button" variant="outline" className="h-9 px-4 bg-white font-bold" onClick={() => document.getElementById("email-l-u")?.click()} disabled={uploadingEmailLogo}>
                                                        {uploadingEmailLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-2" />} Загрузить
                                                    </Button>
                                                    {formData.emailLogoUrl && <Button type="button" variant="ghost" className="h-9 px-2 text-rose-500 text-xs ml-2" onClick={() => setFormData({ ...formData, emailLogoUrl: null })}>Удалить</Button>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <ColorPicker
                                                label="Цвет кнопок и ссылок"
                                                color={formData.emailPrimaryColor || "#5d00ff"}
                                                onChange={(c) => setFormData({ ...formData, emailPrimaryColor: c })}
                                            />
                                            <ColorPicker
                                                label="Цвет текста на кнопках"
                                                color={formData.emailContrastColor || "#ffffff"}
                                                onChange={(c) => setFormData({ ...formData, emailContrastColor: c })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                Подпись (Signature)
                                            </label>
                                            <Input
                                                value={formData.emailSignature || ""}
                                                onChange={(e) => setFormData({ ...formData, emailSignature: e.target.value })}
                                                placeholder="Управляйте вашим мерчем эффективно"
                                                className="h-11 rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                Футер письма (Footer)
                                            </label>
                                            <textarea
                                                value={formData.emailFooter || ""}
                                                onChange={(e) => setFormData({ ...formData, emailFooter: e.target.value })}
                                                placeholder="С уважением, команда MerchCRM"
                                                className="w-full h-24 p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="crm-card p-5 space-y-6">

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                        Telegram (Username)
                                                    </label>
                                                    <Input
                                                        value={formData.socialTelegram || ""}
                                                        onChange={(e) => setFormData({ ...formData, socialTelegram: e.target.value })}
                                                        placeholder="@username"
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                        WhatsApp (Номер)
                                                    </label>
                                                    <Input
                                                        value={formData.socialWhatsapp || ""}
                                                        onChange={(e) => setFormData({ ...formData, socialWhatsapp: e.target.value })}
                                                        placeholder="+79991234567"
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                                        Веб-сайт (URL)
                                                    </label>
                                                    <Input
                                                        value={formData.socialWebsite || ""}
                                                        onChange={(e) => setFormData({ ...formData, socialWebsite: e.target.value })}
                                                        placeholder="https://company.com"
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest opacity-70">
                                                Предпросмотр письма
                                            </div>
                                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scale-90 origin-top">
                                                <div className="p-6 border-b border-slate-100 flex justify-center">
                                                    <img src={formData.emailLogoUrl || formData.logoUrl || "/logo.png"} className="h-8 object-contain" alt="Brand" />
                                                </div>
                                                <div className="p-8 space-y-4">
                                                    <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
                                                    <div className="h-4 w-full bg-slate-100 rounded-full" />
                                                    <div className="h-4 w-1/2 bg-slate-100 rounded-full" />
                                                    <div className="pt-4 flex justify-center">
                                                        <div className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-md" style={{ backgroundColor: formData.emailPrimaryColor || "#5d00ff", color: formData.emailContrastColor || "#ffffff" }}>
                                                            Действие
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-slate-50 text-center space-y-1 border-t border-slate-100">
                                                    <p className="text-[11px] font-bold text-slate-900">{formData.emailSignature || "Подпись компании"}</p>
                                                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-tight">
                                                        {formData.emailFooter || "Футер с контактными данными"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="crm-card p-5 space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">
                                            Логотип для документов (High-Res PNG)
                                        </label>
                                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed flex items-center gap-6">
                                            <div className="w-20 h-20 bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-center shadow-inner">
                                                {formData.printLogoUrl ? <img src={formData.printLogoUrl} className="max-w-full max-h-full object-contain" alt="Print" /> : <Printer className="w-8 h-8 text-slate-200" />}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <input type="file" id="print-u-unified" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "print_logo")} />
                                                <Button type="button" variant="outline" className="h-10 px-6 bg-white font-bold shadow-sm" onClick={() => document.getElementById("print-u-unified")?.click()} disabled={uploadingPrintLogo}>
                                                    {uploadingPrintLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Загрузить логотип
                                                </Button>
                                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Рекомендуется качественный PNG на прозрачном фоне для четкой печати на инвойсах и бланках</p>
                                                {formData.printLogoUrl && <Button type="button" variant="ghost" className="h-8 px-2 text-rose-500 text-xs font-bold" onClick={() => setFormData({ ...formData, printLogoUrl: null })}>Удалить</Button>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/10 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                            Макет страницы A4
                                        </div>
                                        <div className="bg-white p-8 border border-slate-200 shadow-sm rounded-sm w-full max-w-[280px] aspect-[1/1.41] space-y-6">
                                            <div className="flex justify-between items-start">
                                                <img src={formData.printLogoUrl || formData.logoUrl || "/logo.png"} className="h-10 object-contain grayscale opacity-80" alt="Print Logo" />
                                                <div className="text-right space-y-1">
                                                    <div className="h-1.5 w-20 bg-slate-100 ml-auto rounded" />
                                                    <div className="h-1.5 w-14 bg-slate-100 ml-auto rounded" />
                                                </div>
                                            </div>
                                            <div className="h-px bg-slate-100 w-full" />
                                            <div className="space-y-3">
                                                <div className="h-1.5 w-full bg-slate-50 rounded" />
                                                <div className="h-1.5 w-full bg-slate-50 rounded" />
                                                <div className="h-1.5 w-full bg-slate-50 rounded" />
                                                <div className="h-1.5 w-3/4 bg-slate-50 rounded" />
                                            </div>
                                            <div className="mt-auto pt-10">
                                                <div className="h-px bg-slate-100 w-full mb-4" />
                                                <div className="flex justify-between gap-4">
                                                    <div className="h-1.5 w-1/3 bg-slate-50 rounded" />
                                                    <div className="h-1.5 w-1/4 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sounds">
                        <div className="crm-card !p-0 overflow-hidden border border-slate-200/60 bg-white/50 backdrop-blur-xl min-h-[500px] flex flex-col md:flex-row">
                            {/* Sidebar Categories */}
                            <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200/60 bg-slate-50/50 p-2.5 space-y-1 shrink-0">

                                {Object.entries(SOUND_CATEGORIES).map(([key, category]) => {
                                    const getIcon = (catKey: string) => {
                                        switch (catKey) {
                                            case 'notifications': return <Volume2 className="w-4 h-4" />;
                                            case 'orders': return <ShoppingBag className="w-4 h-4" />;
                                            case 'clients': return <Users className="w-4 h-4" />;
                                            case 'warehouse': return <Warehouse className="w-4 h-4" />;
                                            case 'finance': return <Banknote className="w-4 h-4" />;
                                            case 'chat': return <MessageCircle className="w-4 h-4" />;
                                            case 'tasks': return <ListTodo className="w-4 h-4" />;
                                            case 'processes': return <Cpu className="w-4 h-4" />;
                                            case 'printing': return <Printer className="w-4 h-4" />;
                                            case 'scanning': return <ScanLine className="w-4 h-4" />;
                                            case 'interface': return <MousePointer2 className="w-4 h-4" />;
                                            case 'special': return <Stars className="w-4 h-4" />;
                                            default: return <Volume2 className="w-4 h-4" />;
                                        }
                                    };

                                    const shortLabels: Record<string, string> = {
                                        chat: "Чат",
                                        processes: "Процессы",
                                        printing: "Печать",
                                        notifications: "Уведомления"
                                    };

                                    const label = shortLabels[key] || category.label;
                                    const isActive = activeSoundTab === key;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setActiveSoundTab(key)}
                                            className={cn(
                                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-[13px] transition-all group",
                                                isActive
                                                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                                                    : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
                                            )}
                                        >
                                            <span className={cn(
                                                "p-1.5 rounded-lg transition-colors shrink-0",
                                                isActive ? "bg-primary text-white" : "bg-slate-200/50 text-slate-400 group-hover:bg-slate-200"
                                            )}>
                                                {getIcon(key)}
                                            </span>
                                            <span className="whitespace-nowrap flex-1 text-left">{label}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeSoundPointer"
                                                    className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 p-6 lg:p-8 bg-white/30 overflow-y-auto">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSoundTab}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-8"
                                    >
                                        {/* Category Header */}
                                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
                                            <div>
                                                <h2 className="text-xl font-extrabold text-slate-900">{SOUND_CATEGORIES[activeSoundTab as keyof typeof SOUND_CATEGORIES].label}</h2>
                                                <p className="text-sm text-slate-500 mt-1">Настройте звуковое сопровождение для событий в этой категории</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Global controls removed as requested */}
                                            </div>
                                        </div>

                                        {/* Sound List */}
                                        <div className="grid grid-cols-1 gap-4">
                                            {SOUND_CATEGORIES[activeSoundTab as keyof typeof SOUND_CATEGORIES].sounds.map((soundType) => {
                                                const soundInfo: Record<string, { title: string, desc: string }> = {
                                                    // Уведомления и Чат
                                                    notification: { title: "Общее уведомление", desc: "Стандартный сигнал о новом системном событии" },
                                                    notification_success: { title: "Успех", desc: "Подтверждение успешного завершения операции" },
                                                    notification_warning: { title: "Предупреждение", desc: "Внимание на потенциальную проблему или вопрос" },
                                                    notification_error: { title: "Ошибка", desc: "Уведомление о сбое или неверном действии" },
                                                    message_sent: { title: "Сообщение отправлено", desc: "Подтверждение ухода вашего сообщения" },
                                                    message_received: { title: "Новое сообщение", desc: "Входящее сообщение в чате или комментарий" },

                                                    // Заказы
                                                    order_created: { title: "Новый заказ", desc: "Воспроизводится при поступлении нового заказа в систему" },
                                                    order_completed: { title: "Заказ выполнен", desc: "Когда заказ переходит в финальный статус" },
                                                    order_cancelled: { title: "Заказ отменен", desc: "При отмене или удалении активного заказа" },
                                                    order_status_changed: { title: "Смена статуса", desc: "Любое изменение этапа работы над заказом" },

                                                    // Склад
                                                    item_created: { title: "Новый товар", desc: "При добавлении новой позиции в каталог склада" },
                                                    item_updated: { title: "Обновление остатков", desc: "При изменении количества или данных товара" },
                                                    stock_low: { title: "Мало товара", desc: "Когда остаток опускается ниже минимального порога" },
                                                    stock_replenished: { title: "Пополнение", desc: "При успешном оприходовании новой партии" },

                                                    // Задачи
                                                    task_created: { title: "Новая задача", desc: "При назначении задачи вам или вашей команде" },
                                                    task_completed: { title: "Задача выполнена", desc: "Когда ответственный помечает задачу как готовую" },
                                                    task_reminder: { title: "Напоминание о дедлайне", desc: "Воспроизводится за 24 часа до наступления срока" },
                                                    task_deleted: { title: "Задача удалена", desc: "Подтверждение удаления задачи из списка" },
                                                    task_overdue: { title: "Дедлайн просрочен", desc: "Критическое уведомление о пропуске срока" },

                                                    // Процессы
                                                    process_started: { title: "Процесс запущен", desc: "Начало экспорта, импорта или генерации отчета" },
                                                    process_completed: { title: "Процесс завершен", desc: "Успешное окончание фоновой операции" },
                                                    process_failed: { title: "Сбой процесса", desc: "Если экспорт или импорт прервался с ошибкой" },

                                                    // Печать
                                                    print_started: { title: "Отправка на печать", desc: "Когда документ уходит в очередь принтера" },
                                                    document_generated: { title: "Файл готов", desc: "PDF или Excel документ успешно сформирован" },

                                                    // Сканнер
                                                    scan_success: { title: "Успешный скан", desc: "Штрих-код распознан и найден в базе" },
                                                    scan_error: { title: "Ошибка сканера", desc: "Код не распознан или товар не найден" },

                                                    // Финансы
                                                    payment_received: { title: "Оплата получена", desc: "При фиксации входящего платежа от клиента" },
                                                    expense_added: { title: "Расход зафиксирован", desc: "При добавлении новой траты в систему" },

                                                    // Интерфейс
                                                    click: { title: "Клик по кнопке", desc: "Мягкий отклик при нажатии на интерактивные элементы" },
                                                    toggle: { title: "Переключатель", desc: "Звук при включении/выключении функций" },
                                                    modal_open: { title: "Открытие окна", desc: "Появление модального или диалогового окна" },
                                                    modal_close: { title: "Закрытие окна", desc: "Сворачивание или закрытие диалога" },
                                                    tab_switch: { title: "Смена вкладки", desc: "Переход между разделами интерфейса" },

                                                    // Клиенты
                                                    client_created: { title: "Новый клиент", desc: "При регистрации нового контрагента в базе" },
                                                    client_updated: { title: "Данные обновлены", desc: "При редактировании карточки существующего клиента" },
                                                    client_deleted: { title: "Клиент удален", desc: "Подтверждение удаления контрагента из базы" },

                                                    // Специальные
                                                    achievement: { title: "Достижение", desc: "Специальная награда или выполнение плана" },
                                                    level_up: { title: "Новый уровень", desc: "Повышение статуса сотрудника в системе" },
                                                };

                                                const info = soundInfo[soundType] || { title: soundType, desc: "Системное событие" };
                                                const config = formData.soundConfig?.[soundType] || { enabled: true, vibration: true, customUrl: null };
                                                const isCustom = !!config.customUrl;
                                                const isModified = !config.enabled || !config.vibration || isCustom;

                                                const toggleSoundEnabled = () => {
                                                    const newConfig = { ...formData.soundConfig };
                                                    const current = newConfig[soundType] || { enabled: true, vibration: true };
                                                    newConfig[soundType] = { ...current, enabled: !current.enabled };
                                                    setFormData({ ...formData, soundConfig: newConfig });
                                                };

                                                const toggleVibration = () => {
                                                    const newConfig = { ...formData.soundConfig };
                                                    const current = newConfig[soundType] || { enabled: true, vibration: true };
                                                    newConfig[soundType] = { ...current, vibration: !current.vibration };
                                                    setFormData({ ...formData, soundConfig: newConfig });
                                                };

                                                const resetSound = () => {
                                                    const newConfig = { ...formData.soundConfig };
                                                    // Reset everything to defaults
                                                    newConfig[soundType] = { enabled: true, vibration: true, customUrl: null };
                                                    setFormData({ ...formData, soundConfig: newConfig });
                                                };

                                                return (
                                                    <div
                                                        key={soundType}
                                                        className={cn(
                                                            "group relative flex items-center justify-between p-4 rounded-2xl border transition-all",
                                                            config.enabled ? "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20" : "bg-slate-50 border-slate-100 opacity-75"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer",
                                                                config.enabled ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-400"
                                                            )} onClick={toggleSoundEnabled} title={config.enabled ? "Выключить звук" : "Включить звук"}>
                                                                {config.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-60" />}
                                                            </div>
                                                            <div>
                                                                <h4 className={cn("font-bold text-[14px]", config.enabled ? "text-slate-900" : "text-slate-500 line-through")}>
                                                                    {info.title}
                                                                </h4>
                                                                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{info.desc}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">

                                                            {/* Vibration Toggle */}
                                                            <div className="flex items-center gap-3 px-2">
                                                                <span className="text-[12px] font-bold text-slate-500">Вибрация</span>
                                                                <div
                                                                    onClick={toggleVibration}
                                                                    className={cn(
                                                                        "w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 ease-in-out shrink-0",
                                                                        config.vibration ? "bg-primary" : "bg-slate-200 hover:bg-slate-300"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm",
                                                                        config.vibration ? "translate-x-5" : "translate-x-0"
                                                                    )} />
                                                                </div>
                                                            </div>

                                                            <div className="w-px h-5 bg-slate-200 mx-1" />

                                                            {/* Upload Custom Sound */}
                                                            <input
                                                                type="file"
                                                                id={`upload-${soundType}`}
                                                                className="hidden"
                                                                accept="audio/*"
                                                                onChange={(e) => handleFileUpload(e, "sound", soundType as string)}
                                                            />

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className={cn("h-10 w-10 hover:text-slate-900", isCustom ? "text-primary font-bold" : "text-slate-400")}
                                                                title="Заменить звук"
                                                                onClick={() => document.getElementById(`upload-${soundType}`)?.click()}
                                                            >
                                                                <Upload className="w-5 h-5" />
                                                            </Button>

                                                            {/* Reset Button */}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className={cn(
                                                                    "h-10 w-10 transition-colors",
                                                                    isModified ? "text-slate-400 hover:text-rose-500" : "text-slate-200 cursor-not-allowed"
                                                                )}
                                                                disabled={!isModified}
                                                                title="Восстановить по умолчанию"
                                                                onClick={resetSound}
                                                            >
                                                                <RefreshCw className="w-5 h-5" />
                                                            </Button>

                                                            <div className="w-px h-5 bg-slate-200 mx-1" />

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => playSound(soundType as SoundType)}
                                                                disabled={!config.enabled}
                                                                className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-90 text-primary bg-primary/5 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400"
                                                            >
                                                                <Volume2 className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </TabsContent>

                </Tabs>
            </form>

            {/* Custom Success/Error Modal */}
            <ResponsiveModal
                isOpen={modal.open}
                onClose={closeModal}
                title={modal.title}
                description={modal.message}
                className="max-w-md"
            >
                <div className="flex flex-col">
                    {/* Header Icon Section */}
                    <div className={cn(
                        "px-6 py-8 flex flex-col items-center text-center gap-4",
                        modal.type === "success" ? "bg-emerald-50/50" : "bg-rose-50/50"
                    )}>
                        <div className={cn(
                            "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300",
                            modal.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                        )}>
                            {modal.type === "success" ? (
                                <CheckCircle2 className="w-8 h-8" />
                            ) : (
                                <AlertCircle className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{modal.title}</h3>
                            <p className="text-sm font-bold text-slate-500 mt-2 max-w-[280px] leading-relaxed">
                                {modal.message}
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 pt-2 flex flex-col gap-3">
                        {modal.showRefresh && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    closeModal();
                                    window.location.reload();
                                }}
                                className="h-12 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Обновить страницу
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={closeModal}
                            className={cn(
                                "h-12 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 border-none",
                                modal.type === "success"
                                    ? "bg-emerald-500 shadow-emerald-200"
                                    : "bg-rose-500 shadow-rose-200"
                            )}
                        >
                            Понятно
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>
        </div >
    );
}

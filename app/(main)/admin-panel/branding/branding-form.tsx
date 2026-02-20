"use client";

import { useBrandingForm } from "./hooks/useBrandingForm";
import { BrandingTabs } from "./components/BrandingTabs";
import { GeneralSettings } from "./components/GeneralSettings";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { CommunicationSettings } from "./components/CommunicationSettings";
import { SoundSettings } from "./components/SoundSettings";
import { BrandingModal } from "./components/BrandingModal";
import { Button } from "@/components/ui/button";
import { Palette, Database, Save } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SerializedIconGroup } from "@/app/(main)/dashboard/warehouse/category-utils";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";

const BrandingSchema = z.object({
    companyName: z.string().min(2, "Название компании должно содержать минимум 2 символа"),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Неверный формат HEX цвета"),
});

interface BrandingSettings {
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
    isVibrationEnabled?: boolean;
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
}

interface BrandingFormProps {
    initialSettings: BrandingSettings;
    initialIconGroups: SerializedIconGroup[];
}

export function BrandingForm({ initialSettings, initialIconGroups }: BrandingFormProps) {
    const {
        ui,
        setUi,
        formData,
        setFormData,
        handleSubmit,
        handleFileUpload,
        closeModal
    } = useBrandingForm(initialSettings);
    const { toast } = useToast();

    const onSubmitStrinct = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = BrandingSchema.safeParse(formData);
        if (!result.success) {
            toast(result.error.issues[0].message, "error");
            return;
        }
        handleSubmit(e); // Прокидываем ивент в оригинальный хук
    };

    return (
        <div className="space-y-4 pb-20">
            <form onSubmit={onSubmitStrinct} className="space-y-4">
                {/* Header with Save Button */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm">
                            <Palette className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">Внешний вид</h1>
                            <p className="text-slate-500 text-xs font-medium mt-0.5">Настройка логотипа, цветов, звуков и интерфейса CRM</p>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={ui.isLoading}
                        variant="btn-dark"
                        className="h-12 rounded-xl px-8 gap-2 font-bold shadow-lg shadow-black/10 hover:shadow-black/20 transition-all active:scale-[0.98]"
                    >
                        {ui.isLoading ? <Database className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {ui.isLoading ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                </div>

                {/* Tabs for different sections */}
                <Tabs defaultValue="main" value={ui.activeTab} onValueChange={(val) => setUi(prev => ({ ...prev, activeTab: val }))} className="space-y-4">
                    <BrandingTabs ui={ui} />

                    <TabsContent value="main">
                        <GeneralSettings formData={formData} setFormData={setFormData} />
                    </TabsContent>

                    <TabsContent value="ui">
                        <AppearanceSettings
                            formData={formData}
                            setFormData={setFormData}
                            ui={ui}
                            handleFileUpload={handleFileUpload}
                            initialIconGroups={initialIconGroups}
                        />
                    </TabsContent>

                    <TabsContent value="comms">
                        <CommunicationSettings
                            formData={formData}
                            setFormData={setFormData}
                            ui={ui}
                            handleFileUpload={handleFileUpload}
                        />
                    </TabsContent>

                    <TabsContent value="sounds">
                        <SoundSettings
                            formData={formData}
                            setFormData={setFormData}
                            ui={ui}
                            setUi={setUi}
                            handleFileUpload={handleFileUpload}
                        />
                    </TabsContent>
                </Tabs>
            </form>

            {/* Custom Success/Error Modal */}
            <BrandingModal ui={ui} closeModal={closeModal} />
        </div>
    );
}

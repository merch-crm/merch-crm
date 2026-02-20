import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateBrandingSettings, uploadBrandingFile } from "../actions";
import { BrandingSettingsSchema } from "../../validation";
import { playSound, setGlobalSoundConfig } from "@/lib/sounds";

export interface BrandingSettings {
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

export interface BrandingUiState {
    isLoading: boolean;
    activeTab: string;
    activeSoundTab: string;
    uploads: {
        logo: boolean;
        favicon: boolean;
        background: boolean;
        printLogo: boolean;
        emailLogo: boolean;
        crmBg: boolean;
    };
    modal: {
        open: boolean;
        type: "success" | "error";
        title: string;
        message: string;
        showRefresh: boolean;
    };
}

export function useBrandingForm(initialSettings: BrandingSettings) {
    const router = useRouter();
    const [ui, setUi] = useState<BrandingUiState>({
        isLoading: false,
        activeTab: "main",
        activeSoundTab: "notifications",
        uploads: {
            logo: false,
            favicon: false,
            background: false,
            printLogo: false,
            emailLogo: false,
            crmBg: false
        },
        modal: {
            open: false,
            type: "success",
            title: "",
            message: "",
            showRefresh: false
        }
    });

    const [formData, setFormData] = useState<BrandingSettings>(initialSettings);

    // Sync sound config to global state for preview
    useEffect(() => {
        if (formData.soundConfig) {
            setGlobalSoundConfig(formData.soundConfig);
        }
    }, [formData.soundConfig]);

    const showModal = (type: "success" | "error", title: string, message: string, showRefresh = false) => {
        setUi(prev => ({
            ...prev,
            modal: { open: true, type, title, message, showRefresh }
        }));
    };

    const closeModal = () => {
        setUi(prev => ({
            ...prev,
            modal: { ...prev.modal, open: false }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = BrandingSettingsSchema.safeParse(formData);
        if (!validation.success) {
            const errorMessage = validation.error.issues[0].message;
            showModal("error", "Ошибка валидации", errorMessage);
            playSound("notification_error");
            return;
        }

        setUi(prev => ({ ...prev, isLoading: true }));

        const result = await updateBrandingSettings(validation.data as BrandingSettings);

        if (result.error) {
            showModal("error", "Ошибка", result.error);
            playSound("notification_error");
        } else {
            showModal("success", "Успешно", "Настройки сохранены! Обновите страницу для применения изменений.", true);
            playSound("notification_success");
            router.refresh();
        }

        setUi(prev => ({ ...prev, isLoading: false }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon" | "background" | "print_logo" | "sound" | "crm_background" | "email_logo", soundKey?: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadKeyMap: Record<string, keyof BrandingUiState['uploads']> = {
            logo: "logo",
            favicon: "favicon",
            background: "background",
            print_logo: "printLogo",
            crm_background: "crmBg",
            email_logo: "emailLogo"
        };

        const uploadKey = uploadKeyMap[type];
        if (uploadKey) {
            setUi(prev => ({ ...prev, uploads: { ...prev.uploads, [uploadKey]: true } }));
        }

        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("type", type);
        if (soundKey) uploadData.append("soundKey", soundKey);

        try {
            const result = await uploadBrandingFile(uploadData);
            if (result.success && result.url) {
                const urlWithVersion = `${result.url}?v=${Date.now()}`;

                if (type === "sound" && soundKey) {
                    const newConfig = { ...formData.soundConfig };
                    const current = newConfig[soundKey] || { enabled: true, vibration: true };
                    newConfig[soundKey] = { ...current, customUrl: urlWithVersion };
                    setFormData(prev => ({
                        ...prev,
                        soundConfig: newConfig
                    }));
                } else {
                    const keyMap: Record<string, keyof BrandingSettings> = {
                        logo: "logoUrl",
                        favicon: "faviconUrl",
                        background: "loginBackgroundUrl",
                        print_logo: "printLogoUrl",
                        crm_background: "crmBackgroundUrl",
                        email_logo: "emailLogoUrl",
                        sound: "notificationSound"
                    };
                    const field = keyMap[type];
                    if (field) {
                        setFormData(prev => ({
                            ...prev,
                            [field]: urlWithVersion
                        }));
                    }
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
            if (uploadKey) {
                setUi(prev => ({ ...prev, uploads: { ...prev.uploads, [uploadKey]: false } }));
            }
            e.target.value = "";
        }
    };

    return {
        ui,
        setUi,
        formData,
        setFormData,
        handleSubmit,
        handleFileUpload,
        closeModal
    };
}

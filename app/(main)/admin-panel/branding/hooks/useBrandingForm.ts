import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateBrandingSettings } from "../../actions/branding.actions";
import { BrandingSettingsSchema } from "../../validation";
import { playSound, setGlobalSoundConfig } from "@/lib/sounds";
import { useImageUploader } from "@/hooks/use-image-uploader";
import { useToast } from "@/components/ui/toast";

import { BrandingSettings } from "@/lib/types/branding";
export type { BrandingSettings };

export interface BrandingUiState {
  isLoading: boolean;
  activeTab: string;
  activeSoundTab: string;
  uploads: {
    logo: boolean;
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
  const { toast } = useToast();
  const [ui, setUi] = useState<BrandingUiState>({
    isLoading: false,
    activeTab: "main",
    activeSoundTab: "notifications",
    uploads: {
      logo: false,
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

  const { uploadStates, processFiles, cancelUpload } = useImageUploader({
    maxOriginalSizeMB: 15, // branding assets can be large backgrounds
  });

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

    if (!result.success) {
      showModal("error", "Ошибка", result.error);
      playSound("notification_error");
    } else {
      showModal("success", "Успешно", "Настройки сохранены! Обновите страницу для применения изменений.", true);
      playSound("notification_success");
      router.refresh();
    }

    setUi(prev => ({ ...prev, isLoading: false }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "background" | "print_logo" | "sound" | "crm_background" | "email_logo" | "favicon", soundKey?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Map internal types to uploader folders and settings keys
    const configMap: Record<string, { folder: string, field: keyof BrandingSettings, maxSize?: number }> = {
      logo: { folder: "branding", field: "logoUrl", maxSize: 2 },
      background: { folder: "branding", field: "loginBackgroundUrl", maxSize: 10 },
      print_logo: { folder: "branding", field: "printLogoUrl", maxSize: 5 },
      crm_background: { folder: "branding", field: "crmBackgroundUrl", maxSize: 10 },
      email_logo: { folder: "branding", field: "emailLogoUrl", maxSize: 2 },
      sound: { folder: "sounds", field: "notificationSound", maxSize: 5 }
    };

    const config = configMap[type];
    if (!config) return;

    const onFileProcessed = (res: { preview: string }) => {
      if (type === "sound" && soundKey) {
        const newConfig = { ...formData.soundConfig };
        const current = newConfig[soundKey] || { enabled: true, vibration: true };
        newConfig[soundKey] = { ...current, customUrl: res.preview };
        setFormData(prev => ({ ...prev, soundConfig: newConfig }));
      } else {
        setFormData(prev => ({ ...prev, [config.field]: res.preview }));
      }
      playSound("notification_success");
    };

    const onError = (msg: string) => {
      toast(msg, "destructive");
      playSound("notification_error");
    };

    // We use processFiles which handles the whole flow
    await processFiles(
      [file],
      0,
      onFileProcessed,
      onError
    );

    e.target.value = "";
  };

  return {
    ui,
    setUi,
    formData,
    setFormData,
    handleSubmit,
    handleFileUpload,
    cancelUpload,
    uploadStates,
    closeModal
  };
}

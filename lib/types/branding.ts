// @/lib/types/branding.ts

export interface BrandingSettings {
    id?: string;
    userId?: string;
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor?: string;
    faviconUrl?: string | null;
    radiusOuter?: number;
    radiusInner?: number;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    inn?: string | null;
    kpp?: string | null;
    ogrn?: string | null;
    bankDetails?: string | null;
    footerText?: string | null;
    showQrCode?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    
    // UI/Legacy fields
    loginSlogan?: string | null;
    loginBackgroundUrl?: string | null;
    dashboardWelcome?: string | null;
    socialTelegram?: string | null;
    socialWhatsapp?: string | null;
    socialWebsite?: string | null;
    notificationSound?: string | null;
    isVibrationEnabled?: boolean;
    printLogoUrl?: string | null;
    emailLogoUrl?: string | null;
    emailPrimaryColor?: string;
    emailContrastColor?: string;
    emailFooter?: string | null;
    emailSignature?: string | null;
    soundConfig?: Record<string, { enabled: boolean; vibration: boolean; customUrl?: string | null }>;
    backgroundColor?: string | null;
    crmBackgroundUrl?: string | null;
    crmBackgroundBlur?: number;
    crmBackgroundBrightness?: number;
    currencySymbol?: string;
    dateFormat?: string;
    timezone?: string;
}

/**
 * Пользовательский брендинг (полная структура из базы)
 */
export interface UserBrandingSettings {
  id: string;
  userId: string;
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  bankDetails: string | null;
  footerText: string | null;
  showQrCode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BrandingFormData = {
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  bankDetails?: string;
  footerText?: string;
  showQrCode: boolean;
};

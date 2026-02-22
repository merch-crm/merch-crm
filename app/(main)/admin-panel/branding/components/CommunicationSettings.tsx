import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/ui/color-picker";
import { Loader2, Upload, Mail, Printer } from "lucide-react";
import { BrandingSettings, BrandingUiState } from "../hooks/useBrandingForm";

interface CommunicationSettingsProps {
    formData: BrandingSettings;
    setFormData: React.Dispatch<React.SetStateAction<BrandingSettings>>;
    ui: BrandingUiState;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon" | "background" | "print_logo" | "sound" | "crm_background" | "email_logo", soundKey?: string) => Promise<void>;
}

export function CommunicationSettings({ formData, setFormData, ui, handleFileUpload }: CommunicationSettingsProps) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="crm-card p-6 space-y-3">

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Логотип для писем (PNG/JPG)
                            </label>
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed flex items-center gap-3">
                                <div className="w-20 h-12 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center">
                                    {formData.emailLogoUrl ? (
                                        <Image
                                            src={formData.emailLogoUrl}
                                            className="max-w-full max-h-full object-contain"
                                            alt="Email Logo"
                                            width={80}
                                            height={48}
                                        />
                                    ) : (
                                        <Mail className="w-6 h-6 text-slate-200" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input type="file" id="email-l-u" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "email_logo")} />
                                    <Button type="button" variant="outline" className="h-9 px-4 bg-white font-bold" onClick={() => document.getElementById("email-l-u")?.click()} disabled={ui.uploads.emailLogo}>
                                        {ui.uploads.emailLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-2" />} Загрузить
                                    </Button>
                                    {formData.emailLogoUrl && <Button type="button" variant="ghost" className="h-9 px-2 text-rose-500 text-xs ml-2" onClick={() => setFormData(prev => ({ ...prev, emailLogoUrl: null }))}>Удалить</Button>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <ColorPicker
                                label="Цвет кнопок и ссылок"
                                color={formData.emailPrimaryColor || "#5d00ff"}
                                onChange={(c) => setFormData(prev => ({ ...prev, emailPrimaryColor: c }))}
                            />
                            <ColorPicker
                                label="Цвет текста на кнопках"
                                color={formData.emailContrastColor || "#ffffff"}
                                onChange={(c) => setFormData(prev => ({ ...prev, emailContrastColor: c }))}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Подпись (Signature)
                            </label>
                            <Input
                                value={formData.emailSignature || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, emailSignature: e.target.value }))}
                                placeholder="Управляйте вашим мерчем эффективно"
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Футер письма (Footer)
                            </label>
                            <textarea
                                value={formData.emailFooter || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, emailFooter: e.target.value }))}
                                placeholder="С уважением, команда MerchCRM"
                                className="w-full h-24 p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="crm-card p-6 space-y-3">

                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                        Telegram (Username)
                                    </label>
                                    <Input
                                        value={formData.socialTelegram || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, socialTelegram: e.target.value }))}
                                        placeholder="@username"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                        WhatsApp (Номер)
                                    </label>
                                    <Input
                                        value={formData.socialWhatsapp || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, socialWhatsapp: e.target.value }))}
                                        placeholder="+79991234567"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                        Веб-сайт (URL)
                                    </label>
                                    <Input
                                        value={formData.socialWebsite || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, socialWebsite: e.target.value }))}
                                        placeholder="https://company.com"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4 opacity-70">
                                Предпросмотр письма
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scale-90 origin-top">
                                <div className="p-6 border-b border-slate-100 flex justify-center">
                                    <Image
                                        src={formData.emailLogoUrl || formData.logoUrl || "/logo.png"}
                                        className="h-8 w-auto object-contain"
                                        alt="Brand"
                                        width={120}
                                        height={32}
                                    />
                                </div>
                                <div className="p-6 space-y-3">
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
                                    <p className="text-xs font-bold text-slate-900">{formData.emailSignature || "Подпись компании"}</p>
                                    <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-tight">
                                        {formData.emailFooter || "Футер с контактными данными"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="crm-card p-5 space-y-3">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700 ml-1 mb-2 block">
                            Логотип для документов (High-Res PNG)
                        </label>
                        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed flex items-center gap-3">
                            <div className="w-20 h-20 bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-center shadow-inner">
                                {formData.printLogoUrl ? (
                                    <Image
                                        src={formData.printLogoUrl}
                                        className="max-w-full max-h-full object-contain"
                                        alt="Print"
                                        width={80}
                                        height={80}
                                    />
                                ) : (
                                    <Printer className="w-8 h-8 text-slate-200" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <input type="file" id="print-u-unified" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "print_logo")} />
                                <Button type="button" variant="outline" className="h-10 px-6 bg-white font-bold shadow-sm" onClick={() => document.getElementById("print-u-unified")?.click()} disabled={ui.uploads.printLogo}>
                                    {ui.uploads.printLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Загрузить логотип
                                </Button>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">Рекомендуется качественный PNG на прозрачном фоне для четкой печати на инвойсах и бланках</p>
                                {formData.printLogoUrl && <Button type="button" variant="ghost" className="h-8 px-2 text-rose-500 text-xs font-bold" onClick={() => setFormData(prev => ({ ...prev, printLogoUrl: null }))}>Удалить</Button>}
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50/10 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4">
                            Макет страницы A4
                        </div>
                        <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-sm w-full max-w-[280px] aspect-[1/1.41] space-y-3">
                            <div className="flex justify-between items-start">
                                <Image
                                    src={formData.printLogoUrl || formData.logoUrl || "/logo.png"}
                                    className="h-10 w-auto object-contain grayscale opacity-80"
                                    alt="Print Logo"
                                    width={120}
                                    height={40}
                                />
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
                                <div className="flex justify-between gap-3">
                                    <div className="h-1.5 w-1/3 bg-slate-50 rounded" />
                                    <div className="h-1.5 w-1/4 bg-slate-100 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

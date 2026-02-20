import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BrandingSettings } from "../hooks/useBrandingForm";

interface GeneralSettingsProps {
    formData: BrandingSettings;
    setFormData: React.Dispatch<React.SetStateAction<BrandingSettings>>;
}

export function GeneralSettings({ formData, setFormData }: GeneralSettingsProps) {
    const timezoneOptions: SelectOption[] = [
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

    return (
        <div className="space-y-4">
            {/* General & Branding Text Settings Combined */}
            <div className="crm-card p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Название компании
                            </label>
                            <Input
                                value={formData.companyName}
                                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                placeholder="MerchCRM"
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Слоган (Slogan)
                            </label>
                            <Input
                                value={formData.loginSlogan || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, loginSlogan: e.target.value }))}
                                placeholder="Ваша CRM для управления мерчем"
                                className="h-11 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                                Текст приветствия
                            </label>
                            <Input
                                value={formData.dashboardWelcome || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, dashboardWelcome: e.target.value }))}
                                placeholder="Добро пожаловать в систему управления"
                                className="h-11 rounded-xl"
                            />
                            <p className="text-xs text-slate-400 mt-2">Отображается на главной странице после входа</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Regional Settings Block */}
            <div className="crm-card p-6 space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                            Валюта системы
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {["₽", "$", "€", "₴", "₸"].map((sym) => (
                                <Button
                                    key={sym}
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData(prev => ({ ...prev, currencySymbol: sym }))}
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
                                onChange={(e) => setFormData(prev => ({ ...prev, currencySymbol: e.target.value }))}
                                placeholder="Свой..."
                                className="h-10 w-24 rounded-xl text-center font-bold"
                            />
                        </div>
                        <p className="text-xs text-slate-400">Символ валюты для финансовых расчетов</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                            Формат даты
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {["DD.MM.YYYY", "YYYY-MM-DD", "MM/DD/YYYY"].map((fmt) => (
                                <Button
                                    key={fmt}
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData(prev => ({ ...prev, dateFormat: fmt }))}
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
                        <p className="text-xs text-slate-400">Глобальный формат отображения календаря</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">
                            Часовой пояс
                        </label>
                        <Select
                            options={timezoneOptions}
                            value={formData.timezone || "Europe/Moscow"}
                            onChange={(val) => setFormData(prev => ({ ...prev, timezone: val }))}
                            placeholder="Выберите часовой пояс"
                            className="w-full"
                            compact
                        />
                        <p className="text-xs text-slate-400">Часовой пояс для логов и уведомлений</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

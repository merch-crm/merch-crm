import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Upload, RefreshCw, ShoppingBag, Users, Warehouse, Banknote, MessageCircle, ListTodo, Cpu, Printer, ScanLine, MousePointer2, Stars } from "lucide-react";
import { SOUND_CATEGORIES, playSound, SoundType } from "@/lib/sounds";
import { BrandingSettings, BrandingUiState } from "../hooks/useBrandingForm";

interface SoundSettingsProps {
    formData: BrandingSettings;
    setFormData: React.Dispatch<React.SetStateAction<BrandingSettings>>;
    ui: BrandingUiState;
    setUi: React.Dispatch<React.SetStateAction<BrandingUiState>>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon" | "background" | "print_logo" | "sound" | "crm_background" | "email_logo", soundKey?: string) => Promise<void>;
}

export function SoundSettings({ formData, setFormData, ui, setUi, handleFileUpload }: SoundSettingsProps) {
    return (
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
                    const isActive = ui.activeSoundTab === key;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setUi(prev => ({ ...prev, activeSoundTab: key }))}
                            className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-all group",
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
                        key={ui.activeSoundTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {/* Category Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">{SOUND_CATEGORIES[ui.activeSoundTab as keyof typeof SOUND_CATEGORIES].label}</h2>
                                <p className="text-sm text-slate-500 mt-1">Настройте звуковое сопровождение для событий в этой категории</p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Global controls removed as requested */}
                            </div>
                        </div>

                        {/* Sound List */}
                        <div className="grid grid-cols-1 gap-4">
                            {SOUND_CATEGORIES[ui.activeSoundTab as keyof typeof SOUND_CATEGORIES].sounds.map((soundType) => {
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
                                    setFormData(prev => ({ ...prev, soundConfig: newConfig }));
                                };

                                const toggleVibration = () => {
                                    const newConfig = { ...formData.soundConfig };
                                    const current = newConfig[soundType] || { enabled: true, vibration: true };
                                    newConfig[soundType] = { ...current, vibration: !current.vibration };
                                    setFormData(prev => ({ ...prev, soundConfig: newConfig }));
                                };

                                const resetSound = () => {
                                    const newConfig = { ...formData.soundConfig };
                                    // Reset everything to defaults
                                    newConfig[soundType] = { enabled: true, vibration: true, customUrl: null };
                                    setFormData(prev => ({ ...prev, soundConfig: newConfig }));
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
                                            <div role="button" tabIndex={0}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                                                    config.enabled ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-400"
                                                )}
                                                onClick={toggleSoundEnabled}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        toggleSoundEnabled();
                                                    }
                                                }}
                                                title={config.enabled ? "Выключить звук" : "Включить звук"}
                                            >
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
                                                <div role="button" tabIndex={0}
                                                    onClick={toggleVibration}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            toggleVibration();
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 ease-in-out shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
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
    );
}

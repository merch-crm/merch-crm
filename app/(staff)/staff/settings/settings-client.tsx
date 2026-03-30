'use client'

import { useState, useTransition } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'
import {
    Settings,
    Clock,
    RefreshCw,
    Save,
    Wifi,
    Cpu,
    ShieldCheck,
    ShieldAlert,
    ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type IconType } from '@/components/ui/stat-card'
import { toast } from 'sonner'
import {
    updatePresenceSettings,
    testGo2rtcConnection,
    testPythonService
} from './settings.actions'

interface Props {
    initialSettings: Record<string, string | number | boolean>
}

export function SettingsClient({ initialSettings }: Props) {
    const [settings, setSettings] = useState(initialSettings)
    const [isPending, startTransition] = useTransition()
    const [go2rtcStatus, setGo2rtcStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')
    const [pythonStatus, setPythonStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')
    const [testingGo2rtc, setTestingGo2rtc] = useState(false)
    const [testingPython, setTestingPython] = useState(false)

    const handleSave = async () => {
        startTransition(async () => {
            const result = await updatePresenceSettings(settings)

            if (result.success) {
                toast.success('Настройки успешно сохранены')
            } else {
                toast.error(result.error || 'Ошибка при сохранении настроек')
            }
        })
    }

    const handleTestGo2rtc = async () => {
        setTestingGo2rtc(true)
        try {
            const result = await testGo2rtcConnection()
            setGo2rtcStatus(result.success ? 'connected' : 'error')
            if (result.success) {
                toast.success('Соединение с go2rtc установлено')
            } else {
                toast.error(result.error || 'go2rtc недоступен')
            }
        } catch {
            setGo2rtcStatus('error')
        } finally {
            setTestingGo2rtc(false)
        }
    }

    const handleTestPython = async () => {
        setTestingPython(true)
        try {
            const result = await testPythonService()
            setPythonStatus(result.success ? 'connected' : 'error')
            if (result.success) {
                toast.success('Python сервис распознавания работает корректно')
            } else {
                toast.error(result.error || 'Ошибка сервиса распознавания')
            }
        } catch {
            setPythonStatus('error')
        } finally {
            setTestingPython(false)
        }
    }

    const updateSetting = (key: string, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-3 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Настройки системы</h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Конфигурация параметров учёта времени и подключения инфраструктуры
                    </p>
                </div>
                <SubmitButton
                    onClick={handleSave}
                    isLoading={isPending}
                    className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold   text-xs leading-tight text-neutral-500 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                </SubmitButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                <div className="lg:col-span-2 space-y-3">
                    {/* Рабочее время */}
                    <Card className="crm-card border-none shadow-sm bg-white overflow-hidden group">
                        <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100 transition-colors group-hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 text-sm   leading-none">График работы</h2>
                                    <p className="text-xs leading-tight text-neutral-500 text-slate-400 font-bold  tracking-tighter mt-1.5">Определение опозданий и смен</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="p-8 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-3">
                                    <label className="text-xs leading-tight text-neutral-500 font-black   text-slate-500 flex items-center gap-2">
                                        <ArrowRight className="w-3 h-3 text-emerald-500" />
                                        Начало рабочего дня
                                    </label>
                                    <Input
                                        type="time"
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={(settings.work_start_time as string) || '09:00'}
                                        onChange={(e) => updateSetting('work_start_time', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs leading-tight text-neutral-500 font-black   text-slate-500 flex items-center gap-2">
                                        <ArrowRight className="w-3 h-3 text-rose-500 rotate-180" />
                                        Конец рабочего дня
                                    </label>
                                    <Input
                                        type="time"
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-900"
                                        value={(settings.work_end_time as string) || '18:00'}
                                        onChange={(e) => updateSetting('work_end_time', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                                <div className="space-y-3">
                                    <label className="text-xs leading-tight text-neutral-500 font-black   text-slate-500">
                                        Порог опоздания (мин)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="120"
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-900"
                                        value={(settings.late_threshold_minutes as number) || 15}
                                        onChange={(e) => updateSetting('late_threshold_minutes', parseInt(e.target.value))}
                                    />
                                    <p className="text-xs leading-tight text-neutral-500 text-slate-400 font-medium">Допустимое время задержки без фиксации опоздания</p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs leading-tight text-neutral-500 font-black   text-slate-500">
                                        Авто-закрытие (часы)
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="24"
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-900"
                                        value={(settings.auto_clock_out_hours as number) || 12}
                                        onChange={(e) => updateSetting('auto_clock_out_hours', parseInt(e.target.value))}
                                    />
                                    <p className="text-xs leading-tight text-neutral-500 text-slate-400 font-medium">Закрытие смены при отсутствии события ухода</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Распознавание */}
                    <Card className="crm-card border-none shadow-sm bg-white overflow-hidden group">
                        <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100 transition-colors group-hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                                    <Cpu className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 text-sm   leading-none">Алгоритмы распознавания</h2>
                                    <p className="text-xs leading-tight text-neutral-500 text-slate-400 font-bold  tracking-tighter mt-1.5">Точность и чувствительность ИИ</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="p-8 space-y-3">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs leading-tight text-neutral-500 font-black   text-slate-500">
                                        Уверенность (Confidence Index)
                                    </label>
                                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                        {((Number(settings.recognition_confidence) || 0.6) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0.3"
                                    max="0.95"
                                    step="0.05"
                                    value={(settings.recognition_confidence as number) || 0.6}
                                    onChange={(e) => updateSetting('recognition_confidence', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between text-xs leading-tight text-neutral-500 font-black   text-slate-400">
                                    <span className="text-amber-500">Баланс (Больше ложных совпадений)</span>
                                    <span className="text-emerald-500">Строгость (Только точные совпадения)</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <label className="text-xs leading-tight text-neutral-500 font-black   text-slate-500">
                                    Порог бездействия (секунды)
                                </label>
                                <div className="relative max-w-xs">
                                    <Input
                                        type="number"
                                        min="10"
                                        max="300"
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-900 pr-12"
                                        value={(settings.idle_threshold_seconds as number) || 30}
                                        onChange={(e) => updateSetting('idle_threshold_seconds', parseInt(e.target.value))}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">сек</div>
                                </div>
                                <p className="text-xs leading-tight text-neutral-500 text-slate-400 font-medium">Интервал отсутствия в кадре для перевода в статус &quot;Бездействие&quot;</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Правая колонка: Инфраструктура */}
                <div className="space-y-3">
                    <h3 className="text-xs leading-tight text-neutral-500 font-black   text-slate-400 pl-2">Инфраструктура</h3>

                    {/* go2rtc */}
                    <InfrastructureCard
                        title="go2rtc Gateway"
                        description="Стриминг Xiaomi Cloud"
                        status={go2rtcStatus}
                        loading={testingGo2rtc}
                        onTest={handleTestGo2rtc}
                        icon={Wifi}
                        color="blue"
                    >
                        <div className="mt-4 pt-4 border-t border-slate-100/50">
                            <label className="text-xs leading-tight text-neutral-500 font-black   text-slate-400 mb-2 block">Cервис URL</label>
                            <Input
                                className="h-10 rounded-xl bg-white/50 border-slate-200 text-xs font-bold"
                                value={(settings.go2rtc_url as string) || 'http://localhost:1984'}
                                onChange={(e) => updateSetting('go2rtc_url', e.target.value)}
                                placeholder="http://localhost:1984"
                            />
                        </div>
                    </InfrastructureCard>

                    {/* Python Service */}
                    <InfrastructureCard
                        title="AI Recognition"
                        description="Python + InsightFace"
                        status={pythonStatus}
                        loading={testingPython}
                        onTest={handleTestPython}
                        icon={Cpu}
                        color="green"
                    >
                        <div className="mt-4 p-3 bg-white/40 rounded-xl border border-white/60">
                            <p className="text-xs leading-tight text-neutral-500 text-slate-500 font-medium leading-relaxed">
                                Статус AI ядра системы. Обрабатывает векторные эмбеддинги для сопоставления лиц.
                            </p>
                        </div>
                    </InfrastructureCard>

                    <Card className="crm-card bg-indigo-900 border-none shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <CardBody className="p-6 relative z-10">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Settings className="w-5 h-5 text-indigo-300" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Важное примечание</p>
                                    <p className="text-indigo-200 text-xs leading-tight text-neutral-500 font-medium leading-relaxed mt-2 opacity-80">
                                        Изменения параметров распознавания вступают в силу мгновенно для всех активных камер.
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

            </div>
        </div>
    )
}

function InfrastructureCard({
    title,
    description,
    status,
    loading,
    onTest,
    icon: Icon,
    color,
    children
}: {
    title: string,
    description: string,
    status: 'unknown' | 'connected' | 'error',
    loading: boolean,
    onTest: () => void,
    icon: IconType,
    color: 'blue' | 'green',
    children?: React.ReactNode
}) {
    const isConn = status === 'connected'
    const isErr = status === 'error'

    return (
        <Card className={cn("crm-card border-none shadow-sm transition-all overflow-hidden",
            color === 'blue' ?"bg-blue-50/50" :"bg-emerald-50/50"
        )}>
            <CardBody className="p-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center ring-4",
                            color === 'blue' ?"bg-blue-100 text-blue-600 ring-blue-50" :"bg-emerald-100 text-emerald-600 ring-emerald-50"
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-sm leading-none">{title}</h3>
                            <p className="text-xs leading-tight text-neutral-500 text-slate-400 font-bold  tracking-tighter mt-1.5">{description}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-white/80">
                    <div className="flex items-center gap-2">
                        {isConn ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : isErr ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse ml-1" />}
                        <span className={cn("text-xs leading-tight text-neutral-500 font-black",
                            isConn ?"text-emerald-600" : isErr ?"text-rose-600" :"text-slate-400"
                        )}>
                            {isConn ? 'Online' : isErr ? 'Error' : 'Offline'}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onTest}
                        disabled={loading}
                        className="h-8 w-8 p-0 rounded-xl hover:bg-white/80"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5 text-slate-500", loading &&"animate-spin")} />
                    </Button>
                </div>

                {children}
            </CardBody>
        </Card>
    )
}

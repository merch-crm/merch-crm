'use client'

import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SubmitButton } from '@/components/ui/submit-button'
import {
    Video,
    Plus,
    RefreshCw,
    Settings,
    Trash2,
    Wifi,
    WifiOff,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    LogIn,
    Smartphone,
    Play
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCamerasState, useLoginForm, useCameraActions, type XiaomiAccount, type Camera } from './use-cameras'
import { CameraPreview } from '@/components/staff/camera-preview'

// Удалены дублирующиеся интерфейсы (импортируются из use-cameras.ts)

interface Props {
    initialAccounts: XiaomiAccount[]
    initialCameras: Camera[]
    isAdmin: boolean
}

export function CamerasClient({ initialAccounts, initialCameras, isAdmin }: Props) {
    const camerasState = useCamerasState(initialAccounts, initialCameras)
    const loginFormState = useLoginForm()
    const {
        handleXiaomiLogin,
        handleSyncDevices,
        handleDeleteAccount,
        handleToggleCamera,
        handleTestConnection,
        handleUpdateCamera,
        handleOpenLiveView
    } = useCameraActions(camerasState, loginFormState)

    const {
        accounts,
        cameras,
        isPending,
        loginModalOpen, setLoginModalOpen,
        settingsModalOpen, setSettingsModalOpen,
        deleteAccountId, setDeleteAccountId,
        selectedCamera, setSelectedCamera,
        liveViewModalOpen, setLiveViewModalOpen
    } = camerasState

    const { loginForm, setLoginForm, reset: resetLoginForm } = loginFormState

    const statusConfig = {
        online: { label: 'Онлайн', icon: Wifi, color: 'text-green-600 bg-green-50' },
        offline: { label: 'Оффлайн', icon: WifiOff, color: 'text-slate-500 bg-slate-100' },
        error: { label: 'Ошибка', icon: AlertCircle, color: 'text-red-600 bg-red-50' },
        connecting: { label: 'Подключение...', icon: RefreshCw, color: 'text-blue-600 bg-blue-50' }
    }

    const regions = [
        { value: 'cn', label: 'Китай (cn)' },
        { value: 'de', label: 'Европа (de)' },
        { value: 'us', label: 'США (us)' },
        { value: 'ru', label: 'Россия (ru)' },
        { value: 'tw', label: 'Тайвань (tw)' },
        { value: 'sg', label: 'Сингапур (sg)' },
        { value: 'in', label: 'Индия (in)' }
    ]

    return (
        <div className="space-y-3 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Камеры</h1>
                    <p className="text-slate-500 mt-1">
                        Управление камерами Xiaomi Mi Home
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setLoginModalOpen(true)} className="rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить аккаунт
                    </Button>
                )}
            </div>

            {/* Подключённые аккаунты Xiaomi */}
            <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50">
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-slate-600" />
                        <h2 className="font-semibold text-slate-900">Аккаунты Mi Home</h2>
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    {accounts.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-900" />
                            <p className="text-slate-900 font-semibold">Нет подключённых аккаунтов</p>
                            <p className="text-sm text-slate-500 mt-1">Добавьте аккаунт Xiaomi для синхронизации камер</p>
                            {isAdmin && (
                                <Button
                                    variant="default"
                                    className="mt-6 rounded-xl"
                                    onClick={() => setLoginModalOpen(true)}
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Войти в Mi Home
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                            <Smartphone className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {account.nickname || account.email || 'Xiaomi Account'}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {account.email} • {account.region.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-lg hover:bg-slate-50"
                                                onClick={() => handleSyncDevices(account.id)}
                                                disabled={isPending}
                                            >
                                                <RefreshCw className={cn("w-4 h-4 mr-2",
                                                    isPending && "animate-spin"
                                                )} />
                                                Опубликовать
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-lg hover:bg-rose-50 group"
                                                onClick={() => setDeleteAccountId(account.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Список камер */}
            <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50">
                    <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-slate-600" />
                        <h2 className="font-semibold text-slate-900">
                            Камеры ({cameras.length})
                        </h2>
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    {cameras.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Video className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-900" />
                            <p className="text-slate-900 font-semibold">Камеры не найдены</p>
                            <p className="text-sm text-slate-500 mt-1">Опубликуйте устройства из аккаунта Mi Home</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {cameras.map((camera) => {
                                const status = statusConfig[camera.status]

                                return (
                                    <div
                                        key={camera.id}
                                        className={cn("p-5 rounded-3xl border transition-all shadow-sm",
                                            camera.isEnabled
                                                ? "bg-white border-slate-100"
                                                : "bg-slate-50 border-slate-200 opacity-60"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border",
                                                    camera.isEnabled ? "bg-slate-50 border-slate-100" : "bg-slate-100 border-slate-200"
                                                )}>
                                                    <Video className="w-6 h-6 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight">{camera.name}</p>
                                                    <p className="text-[11px] leading-tight text-neutral-500  tracking-wider font-bold text-slate-400 mt-1">
                                                        {camera.model || 'Xiaomi Camera'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] leading-tight text-neutral-500 font-bold  tracking-wider",
                                                status.color
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", status.color.split(' ')[0].replace('text-', 'bg-'))} />
                                                {status.label}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 mb-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                                            {camera.location ? (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <span className="text-xs">📍 {camera.location}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-400 italic">
                                                    <span className="text-xs">Локация не указана</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-[11px] leading-tight text-neutral-500 text-slate-400 font-medium">
                                                <span>DID: {camera.deviceId}</span>
                                                {camera.localIp && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <span>IP: {camera.localIp}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {camera.errorMessage && (
                                            <div className="mb-4 p-2 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2">
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-[11px] leading-tight text-neutral-500 text-rose-600 font-medium leading-normal">
                                                    {camera.errorMessage}
                                                </p>
                                            </div>
                                        )}

                                        {isAdmin && (
                                            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-50 mt-auto">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl h-9 hover:bg-slate-50 text-[11px] leading-tight text-neutral-500 font-bold  tracking-wider"
                                                    onClick={() => handleOpenLiveView(camera)}
                                                >
                                                    <Play className="w-3.5 h-3.5 mr-1.5" />
                                                    Стрим
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl h-9 hover:bg-slate-50 text-[11px] leading-tight text-neutral-500 font-bold  tracking-wider"
                                                    onClick={() => handleTestConnection(camera.id)}
                                                    disabled={isPending}
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                    Тест
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl h-9 hover:bg-slate-50 text-[11px] leading-tight text-neutral-500 font-bold  tracking-wider"
                                                    onClick={() => {
                                                        setSelectedCamera(camera)
                                                        setSettingsModalOpen(true)
                                                    }}
                                                >
                                                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                                                    Настр.
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn("rounded-xl h-9 text-[11px] leading-tight text-neutral-500 font-bold  tracking-wider group",
                                                        camera.isEnabled ? "hover:bg-rose-50 text-slate-500 hover:text-rose-600" : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                                                    )}
                                                    onClick={() => handleToggleCamera(camera.id, !camera.isEnabled)}
                                                >
                                                    {camera.isEnabled ? (
                                                        <>
                                                            <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                                                            Выкл
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                            Вкл
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Модальное окно логина Xiaomi */}
            <ResponsiveModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                title="Вход в Mi Home"
                description="Введите данные вашего аккаунта Xiaomi"
            >
                <form onSubmit={(e) => { e.preventDefault(); handleXiaomiLogin(new FormData(e.currentTarget)) }} className="space-y-3 py-6 px-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 tracking-wider">
                            Email (для идентификации)
                        </label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="example@xiaomi.com"
                            className="rounded-xl h-12 bg-slate-50 border-none shadow-inner"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 tracking-wider">
                            User ID (xiaomiUserId)
                        </label>
                        <Input
                            name="userId"
                            type="text"
                            placeholder="Например: 1234567890"
                            className="rounded-xl h-12 bg-slate-50 border-none shadow-inner"
                            value={loginForm.userId}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, userId: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 tracking-wider">
                            Service Token
                        </label>
                        <Input
                            name="serviceToken"
                            type="text"
                            placeholder="Длинная строка токена"
                            className="rounded-xl h-12 bg-slate-50 border-none shadow-inner"
                            value={loginForm.serviceToken}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, serviceToken: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 tracking-wider">
                            ssecurity Token
                        </label>
                        <Input
                            name="ssecurity"
                            type="text"
                            placeholder="Например: aBcDeFgHiJkLmNoP12345w=="
                            className="rounded-xl h-12 bg-slate-50 border-none shadow-inner"
                            value={loginForm.ssecurity}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, ssecurity: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900  tracking-wider">
                            Регион сервера
                        </label>
                        <Select
                            value={loginForm.region}
                            onChange={(value) => setLoginForm(prev => ({ ...prev, region: value }))}
                            options={regions.map(r => ({ id: r.value, title: r.label }))}
                            placeholder="Выберите регион"
                            triggerClassName="rounded-xl h-12 bg-slate-50 border-none shadow-inner"
                        />
                        {/* Hidden input so FormData picks up the region value */}
                        <input type="hidden" name="region" value={loginForm.region} />
                        <p className="text-[11px] leading-tight text-neutral-500 text-slate-400 font-bold  tracking-tight mt-2 px-1">
                            Выберите регион, который указан в вашем приложении Mi Home
                        </p>
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4">
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            <span className="font-bold flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4" /> Инструкция по получению токена:
                            </span>
                            Для обхода защиты Xiaomi 2FA необходимо извлечь токен вручную. Запустите консольный скрипт <code>npm run xiaomi-token</code> на вашем компьютере для получения User ID, Service Token и ssecurity.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-2xl h-12 border-slate-200 text-slate-600 font-bold   text-[11px] leading-tight text-neutral-500"
                            onClick={() => setLoginModalOpen(false)}
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            className="flex-1 rounded-2xl h-12 font-bold   text-[11px] leading-tight text-neutral-500 shadow-lg shadow-slate-200"
                            isLoading={isPending}
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Войти
                        </SubmitButton>
                    </div>
                </form>
            </ResponsiveModal>

            {/* Модальное окно настроек камеры */}
            <ResponsiveModal
                isOpen={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                title="Настройки камеры"
                description={selectedCamera?.name || ''}
            >
                {selectedCamera && (
                    <form action={handleUpdateCamera} className="space-y-3 py-6 px-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900  tracking-wider">
                                Название устройства
                            </label>
                            <Input
                                name="name"
                                className="rounded-xl h-12 bg-slate-50 border-none shadow-inner"
                                value={selectedCamera.name}
                                onChange={(e) => setSelectedCamera(prev =>
                                    prev ? { ...prev, name: e.target.value } : null
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900  tracking-wider">
                                Расположение (локация)
                            </label>
                            <Input
                                name="location"
                                placeholder="Офис, Вход, Склад..."
                                className="rounded-xl h-12 bg-slate-50 border-none shadow-inner"
                                value={selectedCamera.location || ''}
                                onChange={(e) => setSelectedCamera(prev =>
                                    prev ? { ...prev, location: e.target.value } : null
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-slate-900  tracking-wider">
                                    Порог уверенности ИИ
                                </label>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                                    {((typeof selectedCamera.confidenceThreshold === 'string' ? parseFloat(selectedCamera.confidenceThreshold) : (selectedCamera.confidenceThreshold ?? 0.6)) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <input
                                name="confidenceThreshold"
                                type="range"
                                min="0.3"
                                max="0.95"
                                step="0.05"
                                value={typeof selectedCamera.confidenceThreshold === 'string' ? parseFloat(selectedCamera.confidenceThreshold) : (selectedCamera.confidenceThreshold ?? 0.6)}
                                onChange={(e) => setSelectedCamera(prev =>
                                    prev ? { ...prev, confidenceThreshold: parseFloat(e.target.value) } : null
                                )}
                                className="w-full h-2 bg-indigo-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                            />
                            <p className="text-[11px] leading-tight text-neutral-500 text-slate-400 font-medium leading-relaxed mt-2 p-1">
                                Минимальная уверенность для распознавания лица.
                                Рекомендуется 60-70%. Выше = точнее, но чаще пропуски.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-2xl h-12 border-slate-200 text-slate-600 font-bold   text-[11px] leading-tight text-neutral-500"
                                onClick={() => setSettingsModalOpen(false)}
                            >
                                Отмена
                            </Button>
                            <SubmitButton
                                className="flex-1 rounded-2xl h-12 font-bold   text-[11px] leading-tight text-neutral-500 shadow-lg shadow-indigo-100"
                                isLoading={isPending}
                            >
                                Сохранить изменения
                            </SubmitButton>
                        </div>
                    </form>
                )}
            </ResponsiveModal>

            {/* Диалог подтверждения удаления */}
            <ConfirmDialog
                isOpen={!!deleteAccountId}
                onClose={() => setDeleteAccountId(null)}
                title="Отключить аккаунт?"
                description="Все связанные камеры будут удалены из системы. Данные о присутствии сохранятся."
                confirmText="Да, отключить"
                onConfirm={handleDeleteAccount}
                variant="destructive"
            />

            {/* Модальное окно Live View */}
            <ResponsiveModal
                isOpen={liveViewModalOpen}
                onClose={() => setLiveViewModalOpen(false)}
                title="Прямой эфир"
                description={selectedCamera?.name || ''}
            >
                {selectedCamera && (
                    <div className="p-4">
                        <CameraPreview
                            streamUrl={`http://localhost:1984/api/stream.mp4?src=xiaomi_${selectedCamera.deviceId}`}
                            zones={selectedCamera.workstations.map(w => ({
                                id: w.id,
                                name: w.name,
                                zone: w.zone,
                                color: w.color || '#3B82F6'
                            }))}
                            className="aspect-video w-full"
                        />
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {selectedCamera.model}
                            </div>
                            <div>
                                {selectedCamera.localIp}
                            </div>
                        </div>
                    </div>
                )}
            </ResponsiveModal>
        </div>
    )
}

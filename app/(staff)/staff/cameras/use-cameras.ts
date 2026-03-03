'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
    loginXiaomiAccount,
    syncXiaomiDevices,
    deleteXiaomiAccount,
    toggleCamera,
    updateCameraSettings,
    testCameraConnection
} from './cameras.actions'

export interface XiaomiAccount {
    id: string
    xiaomiUserId: string
    email: string | null
    nickname: string | null
    region: string
    isActive: boolean
    createdAt: Date
}

export interface Camera {
    id: string
    xiaomiAccountId: string | null
    deviceId: string
    model: string | null
    name: string
    location: string | null
    localIp: string | null
    streamUrl: string | null
    status: 'online' | 'offline' | 'error' | 'connecting'
    lastOnlineAt: Date | null
    errorMessage: string | null
    isEnabled: boolean
    confidenceThreshold: string | number | null
    xiaomiAccount: { email: string | null; nickname: string | null } | null
}

export function useCamerasState(initialAccounts: XiaomiAccount[], initialCameras: Camera[]) {
    const [accounts] = useState(initialAccounts)
    const [cameras, setCameras] = useState(initialCameras)
    const [isPending, startTransition] = useTransition()

    // Modal state
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [settingsModalOpen, setSettingsModalOpen] = useState(false)
    const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null)
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
    const [liveViewModalOpen, setLiveViewModalOpen] = useState(false)

    return {
        accounts,
        cameras, setCameras,
        isPending, startTransition,
        loginModalOpen, setLoginModalOpen,
        settingsModalOpen, setSettingsModalOpen,
        deleteAccountId, setDeleteAccountId,
        selectedCamera, setSelectedCamera,
        liveViewModalOpen, setLiveViewModalOpen,
    }
}

export function useLoginForm() {
    const [loginForm, setLoginForm] = useState({ username: '', password: '', region: 'cn' })
    const [showPassword, setShowPassword] = useState(false)

    const reset = () => setLoginForm({ username: '', password: '', region: 'cn' })

    return { loginForm, setLoginForm, showPassword, setShowPassword, reset }
}

export function useCameraActions(
    state: ReturnType<typeof useCamerasState>,
    loginFormState: ReturnType<typeof useLoginForm>
) {
    const {
        setCameras,
        startTransition,
        setLoginModalOpen,
        setSettingsModalOpen,
        deleteAccountId,
        setDeleteAccountId,
        selectedCamera,
        setSelectedCamera,
        setLiveViewModalOpen,
    } = state
    const { loginForm, reset: resetForm } = loginFormState

    const handleXiaomiLogin = async () => {
        if (!loginForm.username || !loginForm.password) {
            toast.error('Введите логин и пароль')
            return
        }
        startTransition(async () => {
            const result = await loginXiaomiAccount(loginForm)
            if (result.success) {
                toast.success(`Аккаунт ${result.data?.nickname || loginForm.username} подключён`)
                setLoginModalOpen(false)
                resetForm()
                window.location.reload()
            } else {
                toast.error(result.error || 'Ошибка авторизации')
            }
        })
    }

    const handleSyncDevices = (accountId: string) => {
        startTransition(async () => {
            const result = await syncXiaomiDevices(accountId)
            if (result.success) {
                toast.success(`Синхронизировано: добавлено ${result.data?.added}, обновлено ${result.data?.updated}`)
                window.location.reload()
            } else {
                toast.error(result.error || 'Ошибка синхронизации')
            }
        })
    }

    const handleDeleteAccount = () => {
        if (!deleteAccountId) return
        startTransition(async () => {
            const result = await deleteXiaomiAccount(deleteAccountId)
            if (result.success) {
                toast.success('Аккаунт удалён')
                setDeleteAccountId(null)
                window.location.reload()
            } else {
                toast.error(result.error || 'Ошибка удаления')
            }
        })
    }

    const handleToggleCamera = (cameraId: string, enabled: boolean) => {
        startTransition(async () => {
            const result = await toggleCamera(cameraId, enabled)
            if (result.success) {
                toast.success(enabled ? 'Камера включена' : 'Камера отключена')
                setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, isEnabled: enabled } : c))
            } else {
                toast.error(result.error || 'Ошибка')
            }
        })
    }

    const handleTestConnection = (cameraId: string) => {
        startTransition(async () => {
            const result = await testCameraConnection(cameraId)
            if (result.success) {
                toast.success(`Статус: ${result.data?.status}`)
                setCameras(prev => prev.map(c =>
                    c.id === cameraId ? { ...c, status: result.data?.status as 'online' | 'offline' | 'error' | 'connecting' } : c
                ))
            } else {
                toast.error(result.error || 'Ошибка подключения')
            }
        })
    }

    const handleUpdateCamera = () => {
        if (!selectedCamera) return
        startTransition(async () => {
            const result = await updateCameraSettings(selectedCamera.id, {
                name: selectedCamera.name,
                location: selectedCamera.location || undefined,
                confidenceThreshold: typeof selectedCamera.confidenceThreshold === 'string'
                    ? parseFloat(selectedCamera.confidenceThreshold)
                    : (selectedCamera.confidenceThreshold ?? undefined)
            })
            if (result.success) {
                toast.success('Настройки сохранены')
                setSettingsModalOpen(false)
                window.location.reload()
            } else {
                toast.error(result.error || 'Ошибка сохранения')
            }
        })
    }

    return {
        handleXiaomiLogin,
        handleSyncDevices,
        handleDeleteAccount,
        handleToggleCamera,
        handleTestConnection,
        handleUpdateCamera,
        handleOpenLiveView: (camera: Camera) => {
            setSelectedCamera(camera)
            setLiveViewModalOpen(true)
        }
    }
}

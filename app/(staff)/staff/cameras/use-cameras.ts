'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type DetectionZone } from '@/lib/schema'
import { toast } from 'sonner'
import {
    addXiaomiAccountByToken,
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
    workstations: Array<{ id: string; name: string; zone: DetectionZone | null; color: string | null }>
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
        liveViewModalOpen, setLiveViewModalOpen
    }
}

export function useLoginForm() {
    const [loginForm, setLoginForm] = useState({
        email: '',
        userId: '',
        serviceToken: '',
        ssecurity: '',
        region: 'ru'
    })

    // reset password state is removed since we use tokens now
    const reset = () => setLoginForm({ email: '', userId: '', serviceToken: '', ssecurity: '', region: 'ru' })

    return { loginForm, setLoginForm, reset }
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
    const { reset: resetForm } = loginFormState
    const router = useRouter()

    const handleXiaomiLogin = async (formData: FormData) => {
        const email = formData.get('email') as string
        const userId = formData.get('userId') as string
        const serviceToken = formData.get('serviceToken') as string
        const ssecurity = formData.get('ssecurity') as string
        const region = formData.get('region') as string

        if (!email || !userId || !serviceToken || !ssecurity) {
            toast.error('Заполните все обязательные поля')
            return
        }

        startTransition(async () => {
            const result = await addXiaomiAccountByToken({ email, userId, serviceToken, ssecurity, region })
            if (result.success) {
                toast.success(`Аккаунт ${result.data?.nickname || email} подключён`)
                setLoginModalOpen(false)
                resetForm()
                router.refresh()
            } else {
                toast.error(result.error || 'Ошибка сохранения аккаунта')
            }
        })
    }

    const handleSyncDevices = (accountId: string) => {
        startTransition(async () => {
            const result = await syncXiaomiDevices(accountId)
            if (result.success) {
                toast.success(`Синхронизировано: добавлено ${result.data?.added}, обновлено ${result.data?.updated}`)
                router.refresh()
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
                router.refresh()
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

    const handleUpdateCamera = async (formData: FormData) => {
        if (!selectedCamera) return

        const name = formData.get('name') as string
        const location = formData.get('location') as string
        const confidenceThresholdRaw = formData.get('confidenceThreshold') as string
        const confidenceThreshold = confidenceThresholdRaw ? parseFloat(confidenceThresholdRaw) : undefined

        startTransition(async () => {
            const result = await updateCameraSettings(selectedCamera.id, {
                name,
                location: location || undefined,
                confidenceThreshold
            })
            if (result.success) {
                toast.success('Настройки сохранены')
                setSettingsModalOpen(false)
                router.refresh()
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

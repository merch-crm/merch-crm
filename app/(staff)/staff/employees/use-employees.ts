'use client'

import { useState, useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { addEmployeeFace, deleteEmployeeFace, setPrimaryFace } from './employees.actions'

export interface EmployeeFace {
    id: string
    userId: string
    photoUrl: string | null
    isPrimary: boolean
    quality: string | number | null
    createdAt: Date
}

export interface Employee {
    id: string
    name: string
    email: string
    role: string
    avatarUrl: string | null
    faces: EmployeeFace[]
    hasFace: boolean
}

// Groups modal/selection state
export function useEmployeeModals() {
    const [addFaceModalOpen, setAddFaceModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [deleteFaceId, setDeleteFaceId] = useState<string | null>(null)

    return { addFaceModalOpen, setAddFaceModalOpen, selectedEmployee, setSelectedEmployee, deleteFaceId, setDeleteFaceId }
}

// Groups webcam capture state
export function useFaceCapture() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                await videoRef.current.play()
            }
            setIsCapturing(true)
            setCapturedImage(null)
        } catch {
            toast.error('Не удалось получить доступ к камере')
        }
    }

    const stopCamera = () => {
        stream?.getTracks().forEach(t => t.stop())
        setStream(null)
        setIsCapturing(false)
    }

    const capturePhoto = (): string | null => {
        if (!videoRef.current || !canvasRef.current) return null
        const canvas = canvasRef.current
        const video = videoRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')?.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(dataUrl)
        stopCamera()
        return dataUrl
    }

    const reset = () => {
        stopCamera()
        setCapturedImage(null)
    }

    return { videoRef, canvasRef, isCapturing, capturedImage, setCapturedImage, startCamera, stopCamera, capturePhoto, reset }
}

// Groups face mutating actions
export function useEmployeeActions(
    startTransition: ReturnType<typeof useTransition>[1],
    modals: ReturnType<typeof useEmployeeModals>,
    capture: ReturnType<typeof useFaceCapture>
) {
    const { setAddFaceModalOpen, selectedEmployee, deleteFaceId, setDeleteFaceId } = modals
    const { capturedImage, reset: resetCapture } = capture

    const handleAddFace = async () => {
        if (!selectedEmployee || !capturedImage) return

        startTransition(async () => {
            try {
                // Convert base64 dataURL to blob and upload
                const res = await fetch(capturedImage)
                const blob = await res.blob()
                const formData = new FormData()
                formData.append('file', blob, 'face.jpg')
                formData.append('userId', selectedEmployee.id)

                const uploadRes = await fetch('/api/upload/face', { method: 'POST', body: formData })
                if (!uploadRes.ok) { toast.error('Ошибка загрузки фото'); return }
                const { url, encoding } = await uploadRes.json()

                const result = await addEmployeeFace({ userId: selectedEmployee.id, photoUrl: url, faceEncoding: encoding })
                if (result.success) {
                    toast.success('Лицо добавлено')
                    setAddFaceModalOpen(false)
                    resetCapture()
                    window.location.reload()
                } else {
                    toast.error(result.error || 'Ошибка добавления')
                }
            } catch {
                toast.error('Неожиданная ошибка')
            }
        })
    }

    const handleDeleteFace = () => {
        if (!deleteFaceId) return
        startTransition(async () => {
            const result = await deleteEmployeeFace(deleteFaceId)
            if (result.success) {
                toast.success('Фото удалено')
                setDeleteFaceId(null)
                window.location.reload()
            } else {
                toast.error(result.error || 'Ошибка удаления')
            }
        })
    }

    const handleSetPrimary = (faceId: string, userId: string) => {
        startTransition(async () => {
            const result = await setPrimaryFace(faceId, userId)
            if (result.success) toast.success('Основное фото обновлено')
            else toast.error(result.error || 'Ошибка')
        })
    }

    return { handleAddFace, handleDeleteFace, handleSetPrimary }
}

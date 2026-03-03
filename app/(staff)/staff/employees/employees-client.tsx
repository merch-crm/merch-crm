'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import { Button } from '@/components/ui/button'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SubmitButton } from '@/components/ui/submit-button'
import {
    Users,
    Camera,
    Trash2,
    Star,
    AlertCircle,
    CheckCircle,
    Upload,
    X,
    UserCheck,
    Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    addEmployeeFace,
    deleteEmployeeFace,
    setPrimaryFace
} from './employees.actions'

interface EmployeeFace {
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

interface Props {
    initialEmployees: Employee[]
    employeesWithoutFaces: { id: string; name: string; email: string }[]
    isAdmin: boolean
}

export function EmployeesClient({ initialEmployees, isAdmin }: Props) {
    const [employees] = useState(initialEmployees)
    const [isPending, startTransition] = useTransition()

    // Модальные окна
    const [addFaceModalOpen, setAddFaceModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [deleteFaceId, setDeleteFaceId] = useState<string | null>(null)

    // Для захвата фото
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 640 }, // Квадратное соотношение для лиц
                    facingMode: 'user'
                }
            })

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                setStream(mediaStream)
                setIsCapturing(true)
            }
        } catch (error) {
            toast.error('Не удалось получить доступ к камере')
            console.error('Camera error:', error)
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        setIsCapturing(false)
    }

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const video = videoRef.current

            const size = Math.min(video.videoWidth, video.videoHeight)
            canvas.width = size
            canvas.height = size

            const ctx = canvas.getContext('2d')
            if (ctx) {
                // Центрируем обрезку под квадрат
                const startX = (video.videoWidth - size) / 2
                const startY = (video.videoHeight - size) / 2
                ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size)

                const imageData = canvas.toDataURL('image/jpeg', 0.9)
                setCapturedImage(imageData)
                stopCamera()
            }
        }
    }

    const handleAddFace = async () => {
        if (!selectedEmployee || !capturedImage) return

        startTransition(async () => {
            try {
                // 1. Получаем эмбеддинг лица через API (прокси к Python сервису)
                const response = await fetch('/api/presence/encode-face', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: capturedImage })
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Ошибка обработки лица')
                }

                const { encoding, quality } = await response.json()

                // 2. Загружаем само фото
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: capturedImage,
                        folder: 'faces'
                    })
                })

                if (!uploadResponse.ok) throw new Error('Ошибка загрузки фото')
                const uploadResult = await uploadResponse.json()
                const photoUrl = uploadResult.url

                // 3. Сохраняем в БД через Server Action
                const result = await addEmployeeFace({
                    userId: selectedEmployee.id,
                    photoUrl,
                    faceEncoding: encoding,
                    quality
                })

                if (result.success) {
                    toast.success('Лицо успешно зарегистрировано')
                    setAddFaceModalOpen(false)
                    setCapturedImage(null)
                    setSelectedEmployee(null)
                    window.location.reload()
                } else {
                    toast.error(result.error || 'Ошибка в базе данных')
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Не удалось обработать фото'
                toast.error(errorMessage)
                console.error('Face registration error:', error)
            }
        })
    }

    const handleDeleteFace = async () => {
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

    const handleSetPrimary = async (faceId: string, userId: string) => {
        startTransition(async () => {
            const result = await setPrimaryFace(faceId, userId)

            if (result.success) {
                toast.success('Фото назначено основным')
                window.location.reload()
            } else {
                toast.error(result.error || 'Ошибка')
            }
        })
    }

    const employeesWithoutFacesFiltered = employees.filter(e => !e.hasFace)

    return (
        <div className="space-y-3 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Сотрудники</h1>
                    <p className="text-slate-500 mt-1">
                        Критически важный этап: регистрация лиц для системы присутствия
                    </p>
                </div>
            </div>

            {/* Верхняя панель статистики */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatSummaryCard
                    title="С биометрией"
                    count={employees.filter(e => e.hasFace).length}
                    icon={UserCheck}
                    color="emerald"
                />
                <StatSummaryCard
                    title="Без биометрии"
                    count={employeesWithoutFacesFiltered.length}
                    icon={AlertCircle}
                    color="rose"
                />
                <StatSummaryCard
                    title="Всего в штате"
                    count={employees.length}
                    icon={Users}
                    color="indigo"
                />
            </div>

            {/* Внимание: Требуется действие */}
            {employeesWithoutFacesFiltered.length > 0 && (
                <Card className="crm-card border-none bg-rose-50/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-rose-50 border-b border-rose-100 p-4">
                        <div className="flex items-center gap-2 text-rose-700">
                            <AlertCircle className="w-5 h-5" />
                            <h2 className="font-bold  tracking-wider text-xs">Требуется регистрация ({employeesWithoutFacesFiltered.length})</h2>
                        </div>
                    </CardHeader>
                    <CardBody className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {employeesWithoutFacesFiltered.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-rose-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                                            <span className="text-sm font-bold text-slate-400">
                                                {employee.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="truncate">
                                            <p className="font-bold text-slate-900 truncate text-sm">{employee.name}</p>
                                            <p className="text-[11px] leading-tight text-neutral-500 text-slate-400 font-medium truncate">{employee.email}</p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[11px] leading-tight text-neutral-500 font-bold   px-3"
                                            onClick={() => {
                                                setSelectedEmployee(employee)
                                                setAddFaceModalOpen(true)
                                            }}
                                        >
                                            <Camera className="w-3.5 h-3.5 mr-1.5" />
                                            Снять
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Список всех сотрудников */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {employees.map((employee) => (
                    <Card
                        key={employee.id}
                        className={cn("crm-card border-none shadow-sm transition-all hover:shadow-md overflow-hidden bg-white",
                            !employee.hasFace &&"opacity-80"
                        )}
                    >
                        <CardBody className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative">
                                    {employee.avatarUrl ? (
                                        <Image
                                            src={employee.avatarUrl}
                                            alt={employee.name}
                                            width={56}
                                            height={56}
                                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-50 shadow-sm">
                                            <span className="text-xl font-bold text-slate-400">
                                                {employee.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {employee.hasFace && (
                                        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-sm">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-lg leading-tight truncate">{employee.name}</p>
                                    <p className="text-xs text-slate-400 font-medium truncate mt-1">{employee.email}</p>
                                </div>
                            </div>

                            {/* Галерея лиц */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] leading-tight text-neutral-500 font-bold   text-slate-400">Биометрия</h3>
                                    {employee.hasFace && (
                                        <span className="text-[11px] leading-tight text-neutral-500 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Активна</span>
                                    )}
                                </div>

                                <div className="flex gap-2.5 flex-wrap">
                                    {employee.faces.map((face) => (
                                        <div
                                            key={face.id}
                                            className={cn("relative group",
                                                face.isPrimary ?"ring-2 ring-indigo-500 ring-offset-2 rounded-xl" :"p-0.5"
                                            )}
                                        >
                                            {face.photoUrl ? (
                                                <Image
                                                    src={face.photoUrl}
                                                    alt="Face"
                                                    width={60}
                                                    height={60}
                                                    className="w-[60px] h-[60px] rounded-xl object-cover border border-slate-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-[60px] h-[60px] rounded-xl bg-slate-100 flex items-center justify-center border border-slate-100">
                                                    <Camera className="w-5 h-5 text-slate-300" />
                                                </div>
                                            )}

                                            {isAdmin && (
                                                <div className="absolute inset-0 bg-indigo-900/40 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                                                    {!face.isPrimary && (
                                                        <button
                                                            onClick={() => handleSetPrimary(face.id, employee.id)}
                                                            className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-indigo-600 shadow-sm transition-transform active:scale-95"
                                                            title="Сделать основным"
                                                        >
                                                            <Star className="w-3.5 h-3.5 fill-current" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteFaceId(face.id)}
                                                        className="p-1.5 bg-white/90 rounded-lg hover:bg-rose-50 text-rose-500 shadow-sm transition-transform active:scale-95"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}

                                            {face.isPrimary && (
                                                <div className="absolute -top-2 -right-2 bg-indigo-500 p-1 rounded-full border-2 border-white shadow-sm">
                                                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isAdmin && (
                                        <button
                                            onClick={() => {
                                                setSelectedEmployee(employee)
                                                setAddFaceModalOpen(true)
                                            }}
                                            className="w-[60px] h-[60px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-slate-400 hover:text-indigo-500 bg-slate-50/50"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Модальное окно захвата фото */}
            <ResponsiveModal
                isOpen={addFaceModalOpen}
                onClose={() => {
                    stopCamera()
                    setCapturedImage(null)
                    setAddFaceModalOpen(false)
                }}
                title="Регистрация биометрии"
                description={selectedEmployee?.name || 'Новое лицо'}
            >
                <div className="space-y-3 py-6 px-4">
                    {!isCapturing && !capturedImage && (
                        <div className="flex flex-col items-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 border-4 border-slate-50">
                                <Camera className="w-10 h-10 text-slate-300" />
                            </div>
                            <p className="text-slate-900 font-bold text-center px-8">
                                Системе нужно фото в анфас с хорошим освещением
                            </p>
                            <p className="text-xs text-slate-400 mt-2 mb-8 text-center px-12">
                                Убедитесь, что лицо полностью попадает в кадр и не перекрыто очками или маской.
                            </p>
                            <Button
                                onClick={startCamera}
                                className="rounded-2xl px-8 h-12 font-bold   text-xs shadow-lg shadow-indigo-100"
                            >
                                Начать захват
                            </Button>
                        </div>
                    )}

                    {isCapturing && (
                        <div className="relative overflow-hidden rounded-3xl bg-black aspect-square max-w-sm mx-auto shadow-2xl ring-4 ring-indigo-500/20">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover mirror"
                            />
                            {/* Рамка-подсказка */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-2/3 h-2/3 border-2 border-white/30 rounded-full border-dashed ring-[400px] ring-black/40" />
                            </div>

                            <div className="absolute bottom-6 inset-x-0 flex gap-3 justify-center">
                                <Button
                                    variant="secondary"
                                    className="rounded-xl h-12 w-12 p-0 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                                    onClick={stopCamera}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <Button
                                    className="rounded-2xl h-12 px-8 bg-white text-indigo-900 hover:bg-indigo-50 font-bold   text-[11px] leading-tight text-neutral-500"
                                    onClick={capturePhoto}
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Снять сейчас
                                </Button>
                            </div>
                        </div>
                    )}

                    {capturedImage && (
                        <div className="space-y-3">
                            <div className="relative overflow-hidden rounded-3xl aspect-square max-w-sm mx-auto shadow-xl ring-4 ring-emerald-500/10">
                                <Image
                                    src={capturedImage}
                                    className="w-full h-full object-cover"
                                    alt="Result"
                                    width={384}
                                    height={384}
                                />
                                <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                    <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-2xl h-14 border-slate-200 text-slate-500 font-bold   text-[11px] leading-tight text-neutral-500"
                                    onClick={() => {
                                        setCapturedImage(null)
                                        startCamera()
                                    }}
                                >
                                    Переснять
                                </Button>
                                <SubmitButton
                                    className="flex-1 rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-700 font-bold   text-[11px] leading-tight text-neutral-500 shadow-lg shadow-indigo-100"
                                    onClick={handleAddFace}
                                    isLoading={isPending}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Подтвердить
                                </SubmitButton>
                            </div>
                        </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </ResponsiveModal>

            {/* Подтверждение удаления */}
            <ConfirmDialog
                isOpen={!!deleteFaceId}
                onClose={() => setDeleteFaceId(null)}
                title="Удалить биометрию?"
                description="Сотрудник больше не будет распознаваться по этому фото. Если это было единственное фото, доступ к системе присутствия для него будет ограничен."
                confirmText="Да, удалить"
                onConfirm={handleDeleteFace}
                variant="destructive"
            />
        </div>
    )
}

function StatSummaryCard({ title, count, icon: Icon, color }: { title: string, count: number, icon: React.ElementType, color: 'emerald' | 'rose' | 'indigo' }) {
    const configs = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' }
    }
    const config = configs[color]

    return (
        <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
            <CardBody className="p-5 flex items-center gap-3">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center ring-4", config.bg, config.text, config.ring)}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-3xl font-bold text-slate-900 leading-none">{count}</p>
                    <p className="text-[11px] leading-tight text-neutral-500 font-bold text-slate-400   mt-2">{title}</p>
                </div>
            </CardBody>
        </Card>
    )
}

'use client'

import { useState, useTransition } from 'react'
import { Card, CardBody } from '@/components/ui/card-bento'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { SubmitButton } from '@/components/ui/submit-button'
import {
    Monitor,
    Plus,
    Settings,
    Trash2,
    Video,
    User,
    Move,
    ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { createWorkstation, updateWorkstation, deleteWorkstation } from './workstations.actions'
import { ZoneEditor } from '@/components/staff/zone-editor'
import { DetectionZone } from '@/lib/schema/presence'

interface Workstation {
    id: string
    name: string
    description: string | null
    cameraId: string | null
    assignedUserId: string | null
    zone: any | null
    color: string | null
    isActive: boolean
    requiresAssignedUser: boolean
    camera?: { name: string; streamUrl: string | null }
    assignedUser?: { name: string; email: string }
}

interface Props {
    initialWorkstations: any[]
    cameras: { id: string; name: string; streamUrl: string | null; deviceId: string }[]
    users: { id: string; name: string; email: string }[]
}

export function WorkstationsClient({ initialWorkstations, cameras, users }: Props) {
    const [workstations, setWorkstations] = useState<Workstation[]>(initialWorkstations)
    const [isPending, startTransition] = useTransition()

    const [modalOpen, setModalOpen] = useState(false)
    const [editingWorkstation, setEditingWorkstation] = useState<Workstation | null>(null)
    const [zoneEditorOpen, setZoneEditorOpen] = useState(false)

    const [form, setForm] = useState({
        name: '',
        description: '',
        cameraId: '',
        assignedUserId: '',
        requiresAssignedUser: false,
        zone: null as any | null,
        color: '#3B82F6'
    })

    const openCreateModal = () => {
        setEditingWorkstation(null)
        setForm({
            name: '',
            description: '',
            cameraId: '',
            assignedUserId: '',
            requiresAssignedUser: false,
            zone: null,
            color: '#3B82F6'
        })
        setModalOpen(true)
    }

    const openEditModal = (ws: Workstation) => {
        setEditingWorkstation(ws)
        setForm({
            name: ws.name,
            description: ws.description || '',
            cameraId: ws.cameraId || '',
            assignedUserId: ws.assignedUserId || '',
            requiresAssignedUser: ws.requiresAssignedUser,
            zone: ws.zone,
            color: ws.color || '#3B82F6'
        })
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (!form.name) {
            toast.error('Введите название')
            return
        }

        startTransition(async () => {
            const data = {
                name: form.name,
                description: form.description || null,
                cameraId: form.cameraId || null,
                assignedUserId: form.assignedUserId || null,
                requiresAssignedUser: form.requiresAssignedUser,
                zone: form.zone,
                color: form.color
            }

            const result = editingWorkstation
                ? await updateWorkstation(editingWorkstation.id, data)
                : await createWorkstation(data)

            if (result.success) {
                toast.success(editingWorkstation ? 'Рабочее место обновлено' : 'Рабочее место создано')
                setModalOpen(false)
                // Refresh local state or use router.refresh() 
                window.location.reload()
            } else {
                toast.error(result.error || 'Ошибка')
            }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить рабочее место?')) return

        startTransition(async () => {
            const result = await deleteWorkstation(id)
            if (result.success) {
                toast.success('Удалено')
                setWorkstations(prev => prev.filter(w => w.id !== id))
            } else {
                toast.error(result.error || 'Ошибка')
            }
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Рабочие места</h1>
                    <p className="text-slate-500 mt-1">
                        Управление физическими рабочими зонами и привязка к ним камер
                    </p>
                </div>
                <Button onClick={openCreateModal} className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                    <Plus className="w-5 h-5 mr-2" />
                    Добавить место
                </Button>
            </div>

            {/* Список рабочих мест */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workstations.map((ws) => (
                    <Card key={ws.id} className="group hover:shadow-xl transition-all duration-300 border-none bg-white shadow-md overflow-hidden">
                        <CardBody className="p-0">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                                            style={{ backgroundColor: `${ws.color}15`, color: ws.color || '#3B82F6' }}
                                        >
                                            <Monitor className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 leading-tight">{ws.name}</h3>
                                            {ws.description && (
                                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{ws.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full ${ws.isActive ? 'bg-green-500' : 'bg-slate-300'} shadow-sm`} />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <Video className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium truncate">{ws.camera?.name || 'Камера не привязана'}</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium truncate">
                                            {ws.assignedUser?.name || 'Любой сотрудник'}
                                        </span>
                                        {ws.requiresAssignedUser && (
                                            <span className="ml-auto text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                                Strict
                                            </span>
                                        )}
                                    </div>

                                    {ws.zone && (
                                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-green-600 mt-1">
                                            <Move className="w-3 h-3" />
                                            Зона детекции настроена
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/50">
                                <button
                                    className="flex-1 py-3.5 text-sm font-semibold text-slate-700 hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                    onClick={() => openEditModal(ws)}
                                >
                                    <Settings className="w-4 h-4" />
                                    Настроить
                                </button>
                                <button
                                    className="px-5 py-3.5 text-slate-400 hover:bg-white hover:text-red-500 transition-all"
                                    onClick={() => handleDelete(ws.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                ))}

                {workstations.length === 0 && (
                    <div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Monitor className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Нет рабочих мест</h3>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                            Создайте свое первое рабочее место, чтобы начать отслеживать активность сотрудников.
                        </p>
                        <Button onClick={openCreateModal} variant="outline" className="mt-8 rounded-xl border-slate-200">
                            Добавить первое место
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Модальное окно создания/редактирования */}
            <ResponsiveModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editingWorkstation ? 'Редактировать рабочее место' : 'Новое рабочее место'}
            >
                <div className="space-y-6 py-4 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Название</label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Напр. Стол 1"
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Цвет метки</label>
                            <div className="flex gap-2">
                                {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`w-10 h-10 rounded-xl transition-all ${form.color === c ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-slate-200' : 'opacity-60 hover:opacity-100'}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setForm(prev => ({ ...prev, color: c }))}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Описание / Расположение</label>
                        <Input
                            value={form.description}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="У окна, второй ряд слева"
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Привязанная камера</label>
                            <select
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white outline-none ring-offset-white focus:ring-2 focus:ring-blue-500 transition-all"
                                value={form.cameraId}
                                onChange={(e) => setForm(prev => ({ ...prev, cameraId: e.target.value, zone: null }))}
                            >
                                <option value="">Не выбрана</option>
                                {cameras.map((cam) => (
                                    <option key={cam.id} value={cam.id}>{cam.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Закреплённый сотрудник</label>
                            <select
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white outline-none ring-offset-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                value={form.assignedUserId}
                                onChange={(e) => setForm(prev => ({ ...prev, assignedUserId: e.target.value }))}
                            >
                                <option value="">Любой сотрудник</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {form.assignedUserId && (
                        <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer group transition-all hover:bg-amber-100/50">
                            <input
                                type="checkbox"
                                checked={form.requiresAssignedUser}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    requiresAssignedUser: e.target.checked
                                }))}
                                className="w-5 h-5 rounded-lg border-amber-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                                <span className="block text-sm font-bold text-amber-900 leading-none">Строгий контроль</span>
                                <span className="text-xs text-amber-700 mt-1">Отправлять уведомление, если на этом месте обнаружен другой человек</span>
                            </div>
                        </label>
                    )}

                    {form.cameraId && (
                        <div className="space-y-2.5 bg-blue-50 p-5 rounded-2xl border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-bold text-blue-900 block">Зона детекции</label>
                                    <p className="text-xs text-blue-600 mt-0.5">
                                        {form.zone ? 'Область настроена' : 'Область не задана'}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 font-bold px-4"
                                    onClick={() => setZoneEditorOpen(true)}
                                >
                                    <Move className="w-4 h-4 mr-2" />
                                    {form.zone ? 'Изменить' : 'Настроить'}
                                </Button>
                            </div>

                            {!form.zone && (
                                <div className="flex items-center gap-2 text-[11px] text-blue-500 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    Если зона не задана, рабочим местом считается весь кадр
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4 pt-6 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-xl text-slate-500 font-bold"
                            onClick={() => setModalOpen(false)}
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg"
                            onClick={handleSave}
                            loading={isPending}
                        >
                            {editingWorkstation ? 'Сохранить изменения' : 'Создать место'}
                        </SubmitButton>
                    </div>
                </div>
            </ResponsiveModal>

            {/* Редактор зоны детекции */}
            {zoneEditorOpen && (
                <ZoneEditor
                    open={zoneEditorOpen}
                    onOpenChange={setZoneEditorOpen}
                    imageUrl={cameras.find(c => c.id === form.cameraId)?.streamUrl?.replace('/stream.mp4', '/frame.jpeg')}
                    videoUrl={cameras.find(c => c.id === form.cameraId)?.streamUrl}
                    initialZone={form.zone}
                    color={form.color}
                    onSave={(zone) => {
                        setForm(prev => ({ ...prev, zone }))
                        setZoneEditorOpen(false)
                    }}
                    onCancel={() => setZoneEditorOpen(false)}
                />
            )}
        </div>
    )
}

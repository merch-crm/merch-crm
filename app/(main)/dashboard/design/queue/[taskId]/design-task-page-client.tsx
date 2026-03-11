"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    ArrowLeft,
    Play,
    Eye,
    CheckCircle2,
    AlertTriangle,
    Clock,
    User,
    Package,
    FileText,
    Pencil,
    MoreHorizontal,
    MessageSquare,
    History,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { updateDesignTaskStatus, takeDesignTask, DesignTaskFull, DesignFile } from "../../actions/order-design-actions";
import { FileUploadZone } from "./components/file-upload-zone";
import { TaskHistory } from "./components/task-history";

interface DesignTaskPageClientProps {
    task: DesignTaskFull;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: "Ожидает", color: "text-slate-700", bgColor: "bg-slate-100" },
    in_progress: { label: "В работе", color: "text-blue-700", bgColor: "bg-blue-100" },
    review: { label: "На проверке", color: "text-purple-700", bgColor: "bg-purple-100" },
    revision: { label: "На доработке", color: "text-orange-700", bgColor: "bg-orange-100" },
    approved: { label: "Утверждён", color: "text-green-700", bgColor: "bg-green-100" },
};

const priorityConfig: Record<number, { label: string; color: string }> = {
    0: { label: "Обычный", color: "bg-slate-500" },
    1: { label: "Высокий", color: "bg-orange-500" },
    2: { label: "Срочный", color: "bg-red-500" },
};

export function DesignTaskPageClient({ task: initialTask }: DesignTaskPageClientProps) {
    const router = useRouter();
    const [task, setTask] = useState(initialTask);
    const [isUpdating, setIsUpdating] = useState(false);

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "approved";

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        const result = await updateDesignTaskStatus(task.id, newStatus as Parameters<typeof updateDesignTaskStatus>[1]);

        if (result.success && result.data) {
            setTask({ ...task, ...result.data });
            toast.success("Статус обновлён");
        } else {
            toast.error(result.error);
        }
        setIsUpdating(false);
    };

    const handleTake = async () => {
        setIsUpdating(true);
        const result = await takeDesignTask(task.id);

        if (result.success && result.data) {
            setTask({ ...task, ...result.data });
            toast.success("Задача взята в работу");
        } else {
            toast.error(result.error);
        }
        setIsUpdating(false);
    };

    // Группировка файлов по типу
    const filesByType = (task.files || []).reduce((acc: Record<string, DesignFile[]>, file: DesignFile) => {
        if (!acc[file.type]) acc[file.type] = [];
        acc[file.type]!.push(file);
        return acc;
    }, {} as Record<string, DesignFile[]>);

    return (
        <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                                {task.number}
                            </Badge>
                            <Badge className={`text-xs ${statusConfig[task.status]?.bgColor} ${statusConfig[task.status]?.color}`}>
                                {statusConfig[task.status]?.label}
                            </Badge>
                            {(task.priority ?? 0) > 0 && (
                                <Badge variant={task.priority === 2 ? "destructive" : "default"} className="text-xs">
                                    {priorityConfig[task.priority ?? 0]?.label}
                                </Badge>
                            )}
                            {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    Просрочено
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-2xl font-semibold">{task.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href={`/dashboard/design/editor/new?taskId=${task.id}&orderId=${task.orderId}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Открыть в редакторе
                        </Link>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" disabled={isUpdating}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {task.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Начать работу
                                </DropdownMenuItem>
                            )}
                            {task.status === "in_progress" && (
                                <DropdownMenuItem onClick={() => handleStatusChange("review")}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Отправить на проверку
                                </DropdownMenuItem>
                            )}
                            {task.status === "review" && (
                                <>
                                    <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Утвердить
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange("revision")}>
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        На доработку
                                    </DropdownMenuItem>
                                </>
                            )}
                            {task.status === "revision" && (
                                <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Продолжить работу
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 space-y-3">
                    {task.description && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base text-muted-foreground font-semibold">Описание</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {task.clientNotes && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2 text-muted-foreground font-semibold">
                                    <MessageSquare className="h-4 w-4" />
                                    Примечания от клиента
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm italic text-muted-foreground whitespace-pre-wrap">
                                    &quot;{task.clientNotes}&quot;
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground font-semibold">
                                <FileText className="h-4 w-4" />
                                Файлы
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="preview">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="preview" className="text-xs">
                                        Превью ({filesByType.preview?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="source" className="text-xs">
                                        Исходники ({filesByType.source?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="mockup" className="text-xs">
                                        Мокапы ({filesByType.mockup?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="client_file" className="text-xs">
                                        От клиента ({filesByType.client_file?.length || 0})
                                    </TabsTrigger>
                                </TabsList>

                                {["preview", "source", "mockup", "client_file"].map((type) => (
                                    <TabsContent key={type} value={type} className="mt-0">
                                        <FileUploadZone
                                            taskId={task.id}
                                            type={type as "preview" | "source" | "mockup" | "client_file"}
                                            files={filesByType[type] || []}
                                            onUpdate={(file: DesignFile) => {
                                                setTask((prev) => ({
                                                    ...prev,
                                                    files: prev.files ? [...prev.files.filter((f) => f.id !== file.id), file] : [file],
                                                }));
                                            }}
                                        />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground font-semibold">
                                <History className="h-4 w-4" />
                                История изменений
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TaskHistory history={task.history || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-muted-foreground font-semibold">Информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {task.order && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Заказ</p>
                                    <Link
                                        href={`/dashboard/orders/${task.order.id}`}
                                        className="font-medium hover:underline flex items-center gap-2 text-sm"
                                    >
                                        <Package className="h-4 w-4" />
                                        #{task.order.orderNumber}
                                    </Link>
                                    {task.order.client && (
                                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                                            {task.order.client.name}
                                        </p>
                                    )}
                                </div>
                            )}

                            <Separator />

                            {task.applicationType && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Тип нанесения</p>
                                    <Badge
                                        variant="outline"
                                        className="text-xs py-0 px-2 font-normal"
                                        style={{
                                            backgroundColor: task.applicationType.color
                                                ? `${task.applicationType.color}15`
                                                : undefined,
                                            color: task.applicationType.color || undefined,
                                            borderColor: task.applicationType.color || undefined,
                                        }}
                                    >
                                        {task.applicationType.name}
                                    </Badge>
                                </div>
                            )}

                            {task.printArea && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Область печати</p>
                                    <p className="font-medium text-sm">{task.printArea}</p>
                                </div>
                            )}

                            {task.quantity && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Количество</p>
                                    <p className="font-medium text-sm">{task.quantity} шт</p>
                                </div>
                            )}

                            <Separator />

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Исполнитель</p>
                                {task.assignee ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={task.assignee.avatar || undefined} />
                                            <AvatarFallback className="text-xs">
                                                {task.assignee.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-sm">{task.assignee.name}</span>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTake}
                                        disabled={isUpdating}
                                        className="h-8 text-xs"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Взять задачу
                                    </Button>
                                )}
                            </div>

                            {task.dueDate && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Срок</p>
                                    <div className={`flex items-center gap-2 text-sm ${isOverdue ? "text-red-600 font-semibold" : ""}`}>
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {format(new Date(task.dueDate), "d MMMM yyyy", { locale: ru })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {formatDistanceToNow(new Date(task.dueDate), {
                                            addSuffix: true,
                                            locale: ru,
                                        })}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Создано</p>
                                <p className="text-[11px] font-medium">
                                    {format(new Date(task.createdAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                                </p>
                                {task.createdByUser && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        кем: {task.createdByUser.name}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {task.sourceDesign && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base text-muted-foreground font-semibold">Исходный дизайн</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link
                                    href={`/dashboard/design/prints/${task.sourceDesign.collectionId}/${task.sourceDesign.id}`}
                                    className="block hover:bg-muted/50 rounded-lg p-3 -m-1 transition-colors border"
                                >
                                    {task.sourceDesign.preview && (
                                        <div className="relative w-full h-32 mb-3">
                                            <Image
                                                src={task.sourceDesign.preview}
                                                alt={task.sourceDesign.name}
                                                fill
                                                className="object-contain bg-white rounded border"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <p className="font-semibold text-sm line-clamp-1">{task.sourceDesign.name}</p>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

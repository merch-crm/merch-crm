"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  UserPlus,
  Phone,
  MessageSquare,
  ShoppingCart,
  Star,
  MoreVertical,
  ExternalLink,
  XCircle,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { IconType } from "@/components/ui/stat-card";
import {
  funnelStages,
  funnelStageLabels,
  funnelStageColors,
  FunnelStage
} from "@/lib/schema/clients/main";
import { updateClientFunnelStage, markClientAsLost } from "../actions/funnel.actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { LostReasonModal } from "../components/lost-reason-modal";
import { type ClientSummary as Client } from "@/lib/types/client";

interface FunnelBoardClientProps {
  initialClients: Client[];
  managers: { id: string; name: string }[];
  initialStats: Record<string, { count: number; amount: number }>;
}

const stageIcons: Record<string, IconType> = {
  lead: UserPlus as IconType,
  first_contact: Phone as IconType,
  negotiation: MessageSquare as IconType,
  first_order: ShoppingCart as IconType,
  regular: Star as IconType,
};

// --- КОМПОНЕНТ КАРТОЧКИ КЛИЕНТА ---
function ClientCard({ client, isOverlay = false }: { client: Client; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: client.id,
    data: {
      type: "Client",
      client,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const amount = Number(client.totalSpent) || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30",
        isOverlay && "shadow-xl border-primary/50 rotate-2 scale-105"
      )}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
              {client.lastName} {client.firstName}
            </p>
            {client.company && (
              <p className="text-xs font-medium text-slate-400 mt-0.5 line-clamp-1">
                {client.company}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <ExternalLink className="w-4 h-4" />
                Открыть карту
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 cursor-pointer">
                <XCircle className="w-4 h-4" />
                Потерян
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-50 mt-1">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">
              {amount > 0 ? `${Math.round(amount).toLocaleString()} ₽` : "—"}
            </span>
          </div>
          {client.lastOrderDate && (
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">
                {format(new Date(client.lastOrderDate), "dd.MM", { locale: ru })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- КОМПОНЕНТ КОЛОНКИ ---
function BoardColumn({
  stage,
  clients,
  stats
}: {
  stage: string;
  clients: Client[];
  stats: { count: number; amount: number }
}) {
  const { setNodeRef } = useSortable({
    id: stage,
    data: {
      type: "Column",
      stage,
    },
  });

  const Icon = (stageIcons[stage] || UserPlus) as IconType;
  const color = funnelStageColors[stage as FunnelStage] || "#64748B";
  const label = funnelStageLabels[stage as FunnelStage] || stage;

  return (
    <div className="flex flex-col gap-3 w-[300px] shrink-0 h-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none group flex items-center gap-1.5">
              {label}
              <span className="text-xs font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                {(clients || []).length}
              </span>
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1.5">
              {Math.round(stats.amount).toLocaleString()} ₽
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div ref={setNodeRef} className="flex-1 space-y-3 min-h-[150px]">
        <SortableContext items={(clients || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
          {(clients || []).map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export function FunnelBoardClient({ initialClients, managers, initialStats }: FunnelBoardClientProps) {
  const [clients, setClients] = useState(initialClients);
  const [stats, _setStats] = useState(initialStats);
  const [managerFilter, setManagerFilter] = useState("all");
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [lostClient, setLostClient] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredClients = useMemo(() => {
    const safeClients = clients || [];
    if (managerFilter === "all") return safeClients;
    if (managerFilter === "none") return safeClients.filter(c => !c.managerId);
    return safeClients.filter(c => c.managerId === managerFilter);
  }, [clients, managerFilter]);

  // Группировка по этапам
  const columns = useMemo(() => {
    const grouped: Record<string, Client[]> = {};
    funnelStages.forEach(stage => {
      grouped[stage] = filteredClients.filter(c => c.funnelStage === stage || (!c.funnelStage && stage === "lead"));
    });
    return grouped;
  }, [filteredClients]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Client") {
      setActiveClient(event.active.data.current.client);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overData = over.data.current;

    if (active.data.current?.type !== "Client") return;

    // Если перетаскиваем над колонкой
    if (overData?.type === "Column") {
      const nextStage = overData.stage;
      setClients(prev => prev.map(c =>
        c.id === activeId ? { ...c, funnelStage: nextStage } : c
      ));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveClient(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overData = over.data.current;
    const activeData = active.data.current;

    const nextStage = overData?.type === "Column"
      ? overData.stage
      : (overData?.client?.funnelStage || "lead");

    const oldClient = activeData?.client;

    if (oldClient.funnelStage !== nextStage) {
      try {
        const res = await updateClientFunnelStage(activeId, nextStage);
        if (res.success) {
          toast("Стадия обновлена", "success");
        } else {
          toast(res.error || "Не удалось обновить стадию", "error");
          setClients(initialClients);
        }
      } catch (_error) {
        toast("Не удалось обновить стадию", "error");
        setClients(initialClients);
      }
    }
  };

  const confirmLost = async (reason: string, comment?: string) => {
    if (!lostClient) return;

    try {
      const res = await markClientAsLost(lostClient, reason, comment);
      if (res.success) {
        setClients(prev => prev.filter(c => c.id !== lostClient));
        toast("Клиент отмечен как потерянный", "success");
        setIsLostModalOpen(false);
        setLostClient(null);
      } else {
        toast(res.error || "Не удалось обновить статус клиента", "error");
      }
    } catch (_error) {
      toast("Не удалось обновить статус клиента", "error");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Select value={managerFilter} onChange={setManagerFilter} options={[ { id: "all", title: "Все менеджеры" }, { id: "none", title: "Не назначен" }, ...managers.map((m) => ({ id: m.id, title: m.name })),
            ]}
            className="w-48"
            compact
          />
          <div className="h-8 w-px bg-slate-100" />
          <div className="flex items-center gap-1">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">{filteredClients.length} чел.</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl border-slate-200">
            Настройки воронки
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full min-w-max pb-4">
            {funnelStages.map((stage) => (
              <BoardColumn key={stage} stage={stage} clients={columns[stage] || []} stats={stats[stage] || { count: 0, amount: 0 }} />
            ))}
          </div>

          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4', }, }, }), }}>
            {activeClient ? (
              <ClientCard client={activeClient} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <LostReasonModal open={isLostModalOpen} onClose={() => setIsLostModalOpen(false)}
        onConfirm={confirmLost}
      />
    </div>
  );
}

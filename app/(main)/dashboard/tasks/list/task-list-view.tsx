"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Eye,
  Trash2,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from "../constants";
import type { Task } from "@/lib/types/tasks";
import { cn } from "@/lib/utils";

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

type SortField = "title" | "status" | "priority" | "deadline" | "createdAt";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 15;

export function TaskListView({
  tasks,
  onTaskClick,
  onDeleteTask,
}: TaskListViewProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "priority":
          const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, normal: 2, low: 3 };
          comparison = (priorityOrder[a.priority as string] ?? 99) - (priorityOrder[b.priority as string] ?? 99);
          break;
        case "deadline":
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          comparison = aDeadline - bDeadline;
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tasks, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredAndSortedTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTasks.map((t) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const SortIcon = sortDirection === "asc" ? SortAsc : SortDesc;

  const isOverdue = (task: Task) =>
    task.deadline &&
    new Date(task.deadline) < new Date() && // suppressHydrationWarning
    task.status !== "done" &&
    task.status !== "cancelled";

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Search and info */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Поиск задач..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-muted/40 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium tracking-wider">
          Показано {paginatedTasks.length} из {filteredAndSortedTasks.length}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={
                    paginatedTasks.length > 0 &&
                    selectedIds.size === paginatedTasks.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary transition-colors font-semibold text-xs tracking-tight py-4"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-2">
                  Название
                  {sortField === "title" && <SortIcon className="h-3.5 w-3.5 text-primary" />}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary transition-colors font-semibold text-xs tracking-tight"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Статус
                  {sortField === "status" && <SortIcon className="h-3.5 w-3.5 text-primary" />}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary transition-colors font-semibold text-xs tracking-tight"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center gap-2">
                  Приоритет
                  {sortField === "priority" && <SortIcon className="h-3.5 w-3.5 text-primary" />}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-xs tracking-tight">
                Исполнители
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary transition-colors font-semibold text-xs tracking-tight"
                onClick={() => handleSort("deadline")}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Срок
                  {sortField === "deadline" && <SortIcon className="h-3.5 w-3.5 text-primary" />}
                </div>
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-20 text-muted-foreground italic border-none"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-muted/50">
                      <Search className="h-6 w-6 opacity-20" />
                    </div>
                    <span>Задачи не найдены</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task) => {
                const statusConfig = TASK_STATUS_CONFIG[task.status] || { color: '#888', label: task.status };
                const priorityConfig = TASK_PRIORITY_CONFIG[task.priority] || { color: '#888', label: task.priority };
                const overdue = isOverdue(task);

                return (
                  <TableRow
                    key={task.id}
                    className={cn(
                      "group cursor-pointer border-border/50 hover:bg-muted/20 transition-all",
                      selectedIds.has(task.id) && "bg-primary/5"
                    )}
                    onClick={() => onTaskClick(task)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} className="py-4 text-center">
                      <Checkbox
                        checked={selectedIds.has(task.id)}
                        onCheckedChange={() => toggleSelect(task.id)}
                        className="mx-auto"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate max-w-[400px]">
                              {task.title}
                            </p>
                            {task.isAutoCreated && (
                              <Badge variant="secondary" className="h-5 px-1 bg-violet-500/10 text-violet-600 border-none">
                                <Zap className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[400px] mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="h-6 px-2 text-xs tracking-wide font-bold"
                        style={{
                          borderColor: `${statusConfig.color}40`,
                          color: statusConfig.color,
                          backgroundColor: `${statusConfig.color}10`,
                        }}
                      >
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                          style={{ backgroundColor: priorityConfig.color }}
                        />
                        <span className="text-xs font-medium">{priorityConfig.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2.5">
                        {task.assignees?.slice(0, 4).map((assignee, _i) => (
                          <Avatar
                            key={assignee.userId}
                            className="h-8 w-8 border-2 border-background ring-1 ring-border/30 shadow-sm"
                          >
                            <AvatarImage
                              src={assignee.user?.image || undefined}
                            />
                            <AvatarFallback className="text-xs font-bold">
                              {assignee.user?.name?.[0] || <Users className="h-3.5 w-3.5" />}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(task.assignees?.length || 0) > 4 && (
                          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold ring-1 ring-border/30">
                            +{(task.assignees?.length || 0) - 4}
                          </div>
                        )}
                        {(!task.assignees || task.assignees.length === 0) && (
                          <span className="text-xs text-muted-foreground italic">Нет исполнителей</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.deadline ? (
                        <div
                          className={cn(
                            "flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full w-fit transition-colors",
                            overdue 
                              ? "bg-destructive/10 text-destructive" 
                              : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                          )}
                        >
                          {overdue ? (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                          {new Date(task.deadline).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs opacity-40">—</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
                          <DropdownMenuItem onClick={() => onTaskClick(task)} className="rounded-lg">
                            <Eye className="h-4 w-4 mr-2 text-primary" />
                            Открыть детали
                          </DropdownMenuItem>
                          {onDeleteTask && (
                            <DropdownMenuItem
                              onClick={() => onDeleteTask(task.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить задачу
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-xs text-muted-foreground font-medium tracking-wide">
            Стр. <span className="text-foreground">{currentPage}</span> из {totalPages}
          </p>
          <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={cn("h-8 w-8 p-0 rounded-lg text-xs", currentPage === pageNumber && "bg-primary/10 text-primary hover:bg-primary/20")}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
          </div>
        </div>
      )}
    </div>
  );
}

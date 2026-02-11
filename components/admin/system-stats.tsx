import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  getSystemStats,
  getMonitoringStats,
  getSecurityStats,
  toggleMaintenanceMode,

  checkSystemHealth,
  createDatabaseBackup,
  getBackupsList,
  deleteBackupAction,
  getSystemSettings,
  updateSystemSetting,
  clearRamAction,
  restartServerAction,
  getCurrentUserAction,
  clearSecurityErrors,
  clearFailedLogins,
} from "@/app/(main)/admin-panel/actions";
import { AuditLogsTable } from "./audit-logs-table";
import {
  Activity,
  Database,
  HardDrive,
  Clock,
  Server,
  ShieldCheck,
  Cpu,
  MemoryStick,
  RefreshCw,
  Download,
  Trash2,
  History,
  FileJson,
  Zap,
  Power,
  Users,
  BarChart3,
  Activity as ActivityIcon,
  Shield,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

function translateErrorMessage(message: string): string {
  if (!message) return "Неизвестная ошибка";

  const rules = [
    { rule: /Cannot read properties of undefined/, text: "Ошибка в коде: попытка чтения свойства у неопределенного объекта (undefined)" },
    { rule: /Cannot read properties of null/, text: "Ошибка в коде: попытка чтения свойства у null-объекта" },
    { rule: /relation.*does not exist/, text: "Ошибка базы данных: таблица или отношение не найдено" },
    { rule: /syntax error/, text: "Ошибка базы данных: синтаксическая ошибка в SQL запросе" },
    { rule: /ECONNREFUSED/, text: "Сбой подключения: сервер или база данных недоступны" },
    { rule: /unique constraint/, text: "Конфликт данных: нарушение уникальности (дубликат)" },
    { rule: /violates not-null constraint/, text: "Ошибка данных: обязательное поле не заполнено" },
    { rule: /invalid input syntax/, text: "Ошибка данных: неверный формат входных значений" },
    { rule: /drizzle-kit: not found/, text: "Системная ошибка: утилита миграций не найдена" },
  ];

  for (const { rule, text } of rules) {
    if (rule.test(message)) return text;
  }

  return message;
}
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StatsData {
  server: {
    cpuLoad: number[];
    totalMem: number;
    freeMem: number;
    uptime: number;
    platform: string;
    arch: string;
    disk?: { total: number; free: number };
  };
  database: {
    size: number;
    tableCounts: Record<string, string | number>;
  };
  storage: {
    size: number;
    fileCount: number;
  };
}

interface HealthData {
  database: { status: string; latency: number };
  storage: { status: string };
  api: { status: string; latency: number };
  overall: string;
  env: { status: string; details: string[] };
  fs: { status: string; message: string };
  backup: { status: string; lastBackup: string | null };
  jwt: { status: string; message: string };
  timestamp: Date;
}

interface BackupFile {
  name: string;
  size: number;
  createdAt: string;
}

interface MonitoringData {
  activeUsers: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role?: string;
    department?: string;
    lastActiveAt: Date | null;
  }>;
  activityStats: { hour: number; type: string; count: number }[];
  entityStats: { type: string; count: number }[];
  performance: number;
}

interface SecurityData {
  failedLogins: Array<{
    id: string;
    email: string;
    reason: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
  }>;
  sensitiveActions: Array<{
    id: string;
    user: string;
    action: string;
    details: Record<string, unknown> | null;
    createdAt: Date;
  }>;
  systemErrors: Array<{
    id: string;
    message: string;
    path?: string | null;
    method?: string | null;
    severity?: string;
    ipAddress?: string | null;
    createdAt: Date;
  }>;
  maintenanceMode: boolean;
}



export function SystemStats() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<
    "monitoring" | "diagnostics" | "backups" | "security" | "action_log"
  >("monitoring");

  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  // Backups state
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);

  // Security state
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const [clearingErrors, setClearingErrors] = useState(false);
  const [clearingLogins, setClearingLogins] = useState(false);
  const [settings, setSettings] = useState<
    Record<string, string | number | boolean | null>
  >({});

  const [clearingRam, setClearingRam] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [selectedError, setSelectedError] = useState<SecurityData['systemErrors'][0] | null>(null);

  // Monitoring state
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(
    null,
  );

  // Poll server availability
  useEffect(() => {
    if (!isRestarting) return;

    const checkServer = async () => {
      try {
        // Try to fetch stats to see if server is back
        const res = await getSystemStats();
        if (res.data) {
          // Server is back! Reload page to reset state and show fresh data
          window.location.reload();
        }
      } catch {
        // Still down, ignore
      }
    };

    const interval = setInterval(checkServer, 2000);
    return () => clearInterval(interval);
  }, [isRestarting]);

  const fetchStats = useCallback(async (manual = false) => {
    if (manual) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await getSystemStats();
      if (res.data) {
        setStats(res.data as StatsData);
        setLastUpdated(new Date());
      } else if (res.error) {
        setError(res.error);
      }
    } catch (e) {
      console.error("Fetch stats error:", e);
      if (manual) setError("Ошибка сети или сервера");
    } finally {
      if (manual) setLoading(false);
    }

    // Fetch monitoring data
    try {
      const start = performance.now();
      const monRes = await getMonitoringStats();
      const end = performance.now();

      if (!monRes.error) {
        setMonitoringData({
          activeUsers: monRes.activeUsers || [],
          activityStats: monRes.activityStats || [],
          entityStats: monRes.entityStats || [],
          performance: Math.round(end - start),
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchSecurityData = useCallback(async () => {
    try {
      const res = await getSecurityStats();
      if (res.failedLogins) {
        setSecurityData(res as SecurityData);
      }
    } catch {
      console.error("Fetch security error");
    }
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const res = await getCurrentUserAction();
      if (res.data?.role?.name === "Администратор") {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  const handleToggleMaintenance = async (enabled: boolean) => {
    setTogglingMaintenance(true);
    try {
      const res = await toggleMaintenanceMode(enabled);
      if (res.success) {
        toast(
          `Режим обслуживания ${enabled ? "включен" : "выключен"} `,
          "success",
        );
        fetchSecurityData();
      } else {
        toast(res.error || "Ошибка", "error");
      }
    } catch {
      toast("Ошибка сети", "error");
    } finally {
      setTogglingMaintenance(false);
    }
  };

  const handleClearSecurityErrors = async () => {
    setClearingErrors(true);
    try {
      const res = await clearSecurityErrors();
      if (res.success) {
        toast("Список ошибок успешно очищен", "success");
        fetchSecurityData();
      } else {
        toast(res.error || "Ошибка", "error");
      }
    } catch {
      toast("Ошибка сети", "error");
    } finally {
      setClearingErrors(false);
    }
  };

  const handleClearFailedLogins = async () => {
    setClearingLogins(true);
    try {
      const res = await clearFailedLogins();
      if (res.success) {
        toast("Список попыток входа очищен", "success");
        fetchSecurityData();
      } else {
        toast(res.error || "Ошибка", "error");
      }
    } catch {
      toast("Ошибка сети", "error");
    } finally {
      setClearingLogins(false);
    }
  };

  const runDiagnostics = async () => {
    setDiagnosing(true);
    const res = await checkSystemHealth();
    if (res.data) {
      setHealthData(res.data as HealthData);
      toast("Параметры системы успешно проверены", "success");
    } else if (res.error) {
      toast(res.error, "error");
    }
    setDiagnosing(false);
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    const res = await createDatabaseBackup();
    if (res.success) {
      toast(`Резервная копия ${res.fileName} создана`, "success");
      fetchBackups();
    } else if (res.error) {
      toast(res.error, "error");
    }
    setCreatingBackup(false);
  };

  const handleDeleteBackup = async () => {
    if (!backupToDelete) return;
    const res = await deleteBackupAction(backupToDelete);
    if (res.success) {
      toast("Резервная копия была успешно удалена", "success");
      fetchBackups();
    } else if (res.error) {
      toast(res.error, "error");
    }
    setBackupToDelete(null);
  };

  useEffect(() => {
    setTimeout(() => fetchStats(), 0);
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "security") {
      fetchSecurityData();
    }
  }, [activeTab, fetchSecurityData]);

  const handleClearRam = async () => {
    setClearingRam(true);
    const res = await clearRamAction();
    if (res.success) {
      toast(res.message || "RAM очищена", "success");
      fetchStats();
    } else {
      toast(res.error || "Ошибка", "error");
    }
    setClearingRam(false);
  };

  const handleRestart = async () => {
    setRestarting(true);
    setShowRestartConfirm(false); // Close dialog
    const res = await restartServerAction();
    if (res.success) {
      toast(res.message || "Перезапуск...", "success");
      // Show full screen overlay
      setIsRestarting(true);
    } else {
      toast(res.error || "Ошибка", "error");
      setRestarting(false);
    }
  };

  const fetchSettings = useCallback(async () => {
    const res = await getSystemSettings();
    if (res.data) setSettings(res.data);
  }, []);

  const fetchBackups = useCallback(async () => {
    setLoadingBackups(true);
    const res = await getBackupsList();
    if (res.data) {
      setBackups(res.data as BackupFile[]);
    } else if (res.error) {
      toast(res.error, "error");
    }
    setLoadingBackups(false);
  }, [toast]);

  useEffect(() => {
    if (activeTab === "backups") {
      setTimeout(() => {
        fetchBackups();
        fetchSettings();
      }, 0);
    }
  }, [activeTab, fetchBackups, fetchSettings]);

  const updateSetting = async (
    key: string,
    value: string | number | boolean | null,
  ) => {
    const res = await updateSystemSetting(key, value);
    if (res.success) {
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast("Настройки сохранены", "success");
    } else {
      toast(res.error || "Ошибка", "error");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}д ${hours}ч ${mins} м`;
  };

  // Calculate time relative (e.g., "5 mins ago")
  const getTimeAgo = (date: string | Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    );

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " год";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " мес";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " дн";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ч";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " мин";

    return Math.floor(seconds) + " сек";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight text-center sm:text-left">
            Управление системой
          </h3>
          <p className="text-slate-400 text-sm font-bold  tracking-normal mt-0.5 text-center sm:text-left">
            Мониторинг, диагностика и резервное копирование
          </p>
        </div>
        <div className="flex bg-slate-100/80 p-1 rounded-[18px] mx-auto sm:mx-0 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab("monitoring")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all  tracking-wider",
              activeTab === "monitoring"
                ? "bg-white text-#5d00ff shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Мониторинг
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all  tracking-wider",
              activeTab === "diagnostics"
                ? "bg-white text-#5d00ff shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Диагностика
          </button>
          <button
            onClick={() => setActiveTab("backups")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all  tracking-wider",
              activeTab === "backups"
                ? "bg-white text-#5d00ff shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Бэкапы
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all  tracking-wider",
              activeTab === "security"
                ? "bg-white text-#5d00ff shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Безопасность
          </button>
          <button
            onClick={() => setActiveTab("action_log")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all  tracking-wider",
              activeTab === "action_log"
                ? "bg-white text-#5d00ff shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Лог действий
          </button>
        </div>
      </div>

      {activeTab === "monitoring" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-1">
            <div className="text-slate-400 text-[10px] font-bold  tracking-normal ">
              Живой поток данных
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-2 hidden sm:block">
                <p className="text-[10px] text-slate-400 font-bold  tracking-wider leading-none">
                  Обновлено
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => fetchStats(true)}
                disabled={loading}
                className="p-2.5 rounded-[18px] border border-slate-200 bg-white text-slate-600 hover:text-#5d00ff hover:border-indigo-100 hover:bg-indigo-50/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn("w-5 h-5", loading && "animate-spin")}
                />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-[18px] border border-red-100 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm font-bold">Ошибка обновления: {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-#5d00ff text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Server size={80} strokeWidth={1} />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-white/80 text-xs font-bold  tracking-normal flex items-center gap-2">
                  <Activity size={14} /> Сервер
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Online</div>
                <div className="text-indigo-100 text-xs mt-1 flex items-center gap-1.5 font-medium">
                  <Clock size={12} />{" "}
                  {stats ? formatUptime(stats.server.uptime) : "..."}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-400 text-[10px] font-bold  tracking-normal flex items-center gap-2">
                  <Cpu size={14} /> Нагрузка CPU
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {stats ? stats.server.cpuLoad[0].toFixed(1) + "%" : "..."}
                </div>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-1000"
                    style={{
                      width: stats
                        ? `${Math.min(stats.server.cpuLoad[0], 100)}% `
                        : "0%",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-400 text-[10px] font-bold  tracking-normal flex items-center gap-2">
                  <MemoryStick size={14} /> Память (RAM)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {stats
                    ? Math.round(
                      ((stats.server.totalMem - stats.server.freeMem) /
                        stats.server.totalMem) *
                      100,
                    ) + "%"
                    : "..."}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  {stats
                    ? `${formatSize(stats.server.totalMem - stats.server.freeMem)} из ${formatSize(stats.server.totalMem)} `
                    : "..."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-400 text-[10px] font-bold  tracking-normal flex items-center gap-2">
                  <Database size={14} /> База данных
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {stats ? formatSize(stats.database.size) : "..."}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-500" />{" "}
                  PostgreSQL
                </p>
              </CardContent>
            </Card>

            {/* Disk Space - 1 col */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-400 text-[10px] font-bold  tracking-normal flex items-center gap-2">
                  <HardDrive size={14} /> Место на диске
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {stats?.server.disk
                    ? (
                      (1 - stats.server.disk.free / stats.server.disk.total) *
                      100
                    ).toFixed(1) + "%"
                    : "..."}
                </div>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000",
                      stats?.server.disk &&
                        stats.server.disk.free / stats.server.disk.total < 0.1
                        ? "bg-rose-500"
                        : "bg-indigo-500",
                    )}
                    style={{
                      width: stats?.server.disk
                        ? `${((1 - stats.server.disk.free / stats.server.disk.total) * 100).toFixed(1)}% `
                        : "0%",
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  {stats?.server.disk
                    ? `${formatSize(stats.server.disk.total - stats.server.disk.free)} из ${formatSize(stats.server.disk.total)} `
                    : "Загрузка..."}
                </p>
              </CardContent>
            </Card>

            {/* API Performance - 1 col */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-400 text-[10px] font-bold  tracking-normal flex items-center gap-2">
                  <ActivityIcon size={14} /> Производительность API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-2xl font-bold transition-all duration-300",
                    !monitoringData
                      ? "text-slate-300"
                      : monitoringData.performance < 200
                        ? "text-emerald-500"
                        : monitoringData.performance < 500
                          ? "text-amber-500"
                          : "text-rose-500",
                  )}
                >
                  {monitoringData ? `${monitoringData.performance} ms` : "..."}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Среднее время ответа сервера
                </p>
              </CardContent>
            </Card>

            {/* Active Sessions - Spans remaining columns (2 cols on lg) */}
            <Card className="border-slate-200/60 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
              <CardHeader className="pb-0 pt-4 px-6">
                <CardTitle className="text-slate-400 text-[10px] font-bold  tracking-normal flex items-center gap-2">
                  <Users size={14} /> Пользователи онлайн
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex items-center">
                {/* Only show if we have data */}
                {!monitoringData ? (
                  <div className="w-full px-6 py-4 flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-slate-100 rounded" />
                      <div className="h-2 w-16 bg-slate-50 rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full px-6 py-4">
                    {monitoringData.activeUsers.length === 0 ? (
                      <div className="flex items-center gap-3 text-slate-400">
                        <Users size={20} />
                        <span className="text-sm font-medium">
                          Нет активных пользователей
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6 overflow-x-auto pb-1">
                        {monitoringData.activeUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 min-w-fit pr-4 border-r border-slate-200 last:border-0"
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden relative">
                                {user.avatar ? (
                                  <Image
                                    src={user.avatar}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  user.name?.[0]
                                )}
                              </div>
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full translate-x-1 translate-y-1 animate-crm-blink shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">
                                {user.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <p className="text-[10px] font-bold text-slate-400  tracking-tight">
                                  Active{" "}
                                  {user.lastActiveAt
                                    ? getTimeAgo(user.lastActiveAt)
                                    : "now"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">
                  Наполнение таблиц
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                  {[
                    { label: "Заказы", key: "orders" },
                    { label: "Клиенты", key: "clients" },
                    { label: "Работники", key: "users" },
                    { label: "Логи", key: "auditLogs" },
                    { label: "Склад (типы)", key: "inventoryItems" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-3 rounded-[18px] bg-slate-50/50 border border-slate-200"
                    >
                      <p className="text-[10px] font-bold text-slate-400  tracking-normal mb-1">
                        {item.label}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {stats ? stats.database.tableCounts[item.key] : "0"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">
                  Хранилище
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive size={16} className="text-indigo-500" />
                    <span className="text-sm font-medium text-slate-600">
                      uploads/
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {stats ? formatSize(stats.storage.size) : "0 MB"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: stats
                        ? `${Math.min((stats.storage.size / (1024 * 1024 * 1024)) * 100, 100)}% `
                        : "0%",
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-right font-bold ">
                  {stats ? stats.storage.fileCount : 0} файлов
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance Controls Moved from Diagnostics */}
          <div className="mt-6">
            <h5 className="text-[10px] font-bold  tracking-normal text-slate-400 mb-4 px-1">
              Инструменты обслуживания
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-[18px] bg-white border border-slate-200/60 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-[18px] bg-indigo-50 text-#5d00ff group-hover:bg-#5d00ff group-hover:text-white transition-all shadow-sm">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Очистка RAM
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                      Принудительный запуск Garbage Collector
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearRam}
                  disabled={clearingRam}
                  className="px-5 py-2.5 bg-slate-50 text-slate-600 text-[11px] font-bold  tracking-wider rounded-[18px] hover:bg-indigo-50 hover:text-#5d00ff border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {clearingRam ? "Очистка..." : "Очистить"}
                </button>
              </div>

              <div className="p-5 rounded-[18px] bg-white border border-slate-200/60 shadow-sm flex items-center justify-between group hover:border-rose-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-[18px] bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                    <Power size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Перезагрузка
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                      Мягкий перезапуск инстанса Next.js
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRestartConfirm(true)}
                  disabled={restarting}
                  className="px-5 py-2.5 bg-rose-500 text-white text-[11px] font-bold  tracking-wider rounded-[18px] hover:bg-rose-600 shadow-md shadow-rose-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {restarting ? "Запуск..." : "Рестарт"}
                </button>
              </div>
            </div>
          </div>

          {/* Activity Graph - Full Width in separate section now */}
          <div className="mt-6">
            {/* Activity Graph */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-6 pt-7 px-8 bg-white border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-[18px]">
                      <BarChart3 size={18} />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-800">
                      Активность системы
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-bold  tracking-normal text-slate-400">
                    Действия за последние 24 часа
                  </CardDescription>
                </div>
                <div className="text-2xl font-bold text-#5d00ff">
                  {monitoringData
                    ? monitoringData.activityStats.reduce(
                      (acc, curr) => acc + curr.count,
                      0,
                    )
                    : "0"}{" "}
                  <span className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">
                    действий
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-8 px-8">
                {/* Bar Chart */}
                <div className="space-y-2">
                  <div className="h-[120px] w-full flex items-end gap-1 px-1">
                    {!monitoringData
                      ? [...Array(24)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-slate-50 animate-pulse rounded-t-sm h-1/4"
                        />
                      ))
                      : [...Array(24)].map((_, i) => {
                        const hourStats = monitoringData.activityStats.filter(
                          (s) => Number(s.hour) === i,
                        );
                        const totalCount = hourStats.reduce(
                          (acc, s) => acc + s.count,
                          0,
                        );
                        const maxVal = Math.max(
                          ...[...Array(24)].map((_, h) =>
                            monitoringData.activityStats
                              .filter((s) => Number(s.hour) === h)
                              .reduce((acc, s) => acc + s.count, 0),
                          ),
                          0,
                        );
                        const max = maxVal < 5 ? 10 : maxVal;
                        const totalHeight = Math.max(
                          (totalCount / max) * 100,
                          5,
                        );

                        return (
                          <div
                            key={i}
                            className="flex-1 group relative h-full flex flex-col justify-end"
                          >
                            <div
                              className="w-full flex flex-col-reverse justify-end overflow-hidden rounded-t-[4px] bg-slate-50/50"
                              style={{ height: `${totalHeight}% ` }}
                            >
                              {hourStats.length > 0 ? (
                                hourStats.map((stat, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "w-full transition-all duration-300",
                                      stat.type === "orders"
                                        ? "bg-blue-500"
                                        : stat.type === "inventory"
                                          ? "bg-amber-500"
                                          : stat.type === "users"
                                            ? "bg-emerald-500"
                                            : stat.type === "auth"
                                              ? "bg-indigo-500"
                                              : "bg-slate-400",
                                    )}
                                    style={{
                                      height: `${(stat.count / totalCount) * 100}% `,
                                    }}
                                  />
                                ))
                              ) : (
                                <div className="w-full h-full bg-slate-100/50" />
                              )}
                            </div>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                              <div className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-[18px] shadow-xl whitespace-nowrap space-y-1">
                                <div className="pb-1 border-b border-white/10">
                                  {totalCount}{" "}
                                  {Math.abs(totalCount % 10) === 1 &&
                                    totalCount % 100 !== 11
                                    ? "действие"
                                    : [2, 3, 4].includes(totalCount % 10) &&
                                      ![12, 13, 14].includes(
                                        totalCount % 100,
                                      )
                                      ? "действия"
                                      : "действий"}
                                </div>
                                {hourStats.map((s) => (
                                  <div
                                    key={s.type}
                                    className="flex items-center justify-between gap-4 font-normal text-[9px] opacity-80"
                                  >
                                    <span className="capitalize">
                                      {s.type === "orders"
                                        ? "Заказы"
                                        : s.type === "inventory"
                                          ? "Склад"
                                          : s.type}
                                      :
                                    </span>
                                    <span>{s.count}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 shadow-xl" />
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Time Labels Row */}
                  <div className="w-full flex gap-1 px-1 border-t border-slate-200 pt-2">
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className="flex-1 text-center">
                        {i % 4 === 0 && (
                          <span className="text-[9px] text-slate-400 font-bold">
                            {i.toString().padStart(2, "0")}:00
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Breakdown Legend */}
                {monitoringData && monitoringData.entityStats.length > 0 && (
                  <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200">
                    {monitoringData.entityStats.map((stat) => (
                      <div key={stat.type} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            stat.type === "orders"
                              ? "bg-blue-500"
                              : stat.type === "inventory"
                                ? "bg-amber-500"
                                : stat.type === "users"
                                  ? "bg-emerald-500"
                                  : stat.type === "auth"
                                    ? "bg-indigo-500"
                                    : "bg-slate-400",
                          )}
                        />
                        <span className="text-[10px] font-bold text-slate-600  tracking-tight">
                          {stat.type === "orders"
                            ? "Заказы"
                            : stat.type === "inventory"
                              ? "Склад"
                              : stat.type === "users"
                                ? "Пользователи"
                                : stat.type === "auth"
                                  ? "Авторизация"
                                  : stat.type === "system"
                                    ? "Система"
                                    : stat.type}
                          :
                        </span>
                        <span className="text-[10px] font-bold text-slate-900">
                          {stat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 px-1">
          <div className="space-y-8">
            {/* Security Section Header */}
            <div className="px-1 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  Безопасность
                </h4>
                <p className="text-xs font-bold  tracking-wider text-slate-400">
                  Режим обслуживания и фильтрация входа
                </p>
              </div>
              <button
                onClick={() => fetchStats(true)}
                className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-[18px] hover:text-#5d00ff hover:border-indigo-100 hover:bg-indigo-50/50 transition-all active:scale-95 shadow-sm"
                title="Обновить данные"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-6 pb-4">
              {/* Maintenance Mode */}
              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-[32px] border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-#5d00ff rounded-[18px]">
                        <Shield size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          Режим обслуживания
                        </CardTitle>
                        <p className="text-[10px] text-slate-400 font-bold  tracking-normal mt-0.5">
                          Ограничение доступа к системе
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[11px] font-bold  tracking-wider",
                        securityData?.maintenanceMode
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-600",
                      )}
                    >
                      {securityData?.maintenanceMode ? "Активен" : "Выключен"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-6">
                  <div className="flex items-center justify-between gap-8 bg-slate-50/50 p-6 rounded-[18px] border border-slate-200/50">
                    <div className="space-y-1">

                      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[320px]">
                        При активации доступ к CRM будет разрешен только
                        администраторам.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleMaintenance(!securityData?.maintenanceMode)
                      }
                      disabled={togglingMaintenance}
                      className={cn(
                        "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                        securityData?.maintenanceMode
                          ? "bg-#5d00ff shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                          : "bg-slate-200",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform duration-300",
                          securityData?.maintenanceMode
                            ? "translate-x-7"
                            : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Failed Logins Table */}
              <Card className="border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden bg-white rounded-[32px] border">
                <CardHeader className="pb-4 border-b border-slate-200 bg-slate-50/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-[18px]">
                        <Lock size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          Попытки входа (24ч)
                        </CardTitle>
                        <p className="text-[10px] text-slate-400 font-bold  tracking-normal mt-0.5">
                          Мониторинг безопасности доступа
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClearFailedLogins}
                      disabled={clearingLogins || !securityData?.failedLogins.length}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 text-[10px] font-bold  tracking-normal rounded-[18px] transition-all active:scale-95 shadow-sm",
                        securityData?.failedLogins.length && !clearingLogins
                          ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-200"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                      )}
                    >
                      <Trash2 size={14} />
                      {clearingLogins ? "Очистка..." : "Очистить список"}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ResponsiveDataView
                    data={securityData?.failedLogins || []}
                    renderCard={(login, idx) => (
                      <div key={login.id || idx} className="p-4 bg-white border border-slate-100 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                              <AlertTriangle size={14} />
                            </div>
                            <span className="text-sm font-bold text-slate-900">{login.email}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{getTimeAgo(login.createdAt)} назад</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            login.reason === "password_mismatch" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {login.reason === "password_mismatch" ? "Неверный пароль" : "Пользователь не найден"}
                          </span>
                          <code className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                            {login.ipAddress || "Unknown"}
                          </code>
                        </div>
                      </div>
                    )}
                    renderTable={() => (
                      <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400  tracking-normal">Email / Аккаунт</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400  tracking-normal">Причина</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400  tracking-normal">IP Адрес</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-slate-400  tracking-normal">Дата и время</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {securityData?.failedLogins.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-400 font-bold text-[10px]  tracking-normal">
                                  Атак не обнаружено
                                </td>
                              </tr>
                            ) : (
                              securityData?.failedLogins.map((login) => (
                                <tr key={login.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-rose-50 text-rose-500 rounded-[18px] group-hover:scale-110 transition-transform">
                                        <AlertTriangle size={14} />
                                      </div>
                                      <span className="text-sm font-bold text-slate-700">{login.email}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-[18px] text-[10px] font-bold  tracking-tight",
                                      login.reason === "password_mismatch" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                      {login.reason === "password_mismatch" ? "Неверный пароль" : "Пользователь не найден"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <code className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100/50 px-2 py-1 rounded">
                                      {login.ipAddress || "Unknown"}
                                    </code>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-[10px] font-bold text-slate-400 ">
                                      {getTimeAgo(login.createdAt)} назад
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>


          {/* System Errors Table */}
          <Card className="border-rose-100 shadow-xl shadow-rose-200/20 overflow-hidden bg-white rounded-[32px] border">
            <CardHeader className="pb-4 border-b border-rose-50 bg-rose-50/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-600 text-white rounded-[18px] shadow-lg shadow-rose-200 flex items-center justify-center">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-rose-950">
                      Системные ошибки
                    </CardTitle>
                    <p className="text-[10px] text-rose-400 font-bold  tracking-normal mt-0.5">
                      Критические сбои и исключения
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearSecurityErrors}
                  disabled={clearingErrors || !securityData?.systemErrors.length}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-[10px] font-bold  tracking-normal rounded-[18px] transition-all active:scale-95 shadow-sm",
                    securityData?.systemErrors.length && !clearingErrors
                      ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-200"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                  )}
                >
                  <Trash2 size={14} />
                  {clearingErrors ? "Очистка..." : "Очистить ошибки"}
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveDataView
                data={securityData?.systemErrors || []}
                renderCard={(error, idx) => (
                  <div key={error.id || idx} className="p-4 bg-white border border-rose-100 rounded-2xl space-y-3" onClick={() => setSelectedError(error)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-1 min-w-0 flex-col">
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {translateErrorMessage(error.message)}
                        </p>
                        {error.path && (
                          <p className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                            {error.method || 'REQ'} {error.path}
                          </p>
                        )}
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0",
                        error.severity === "critical" ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-600"
                      )}>
                        {error.severity === "critical" ? "Критично" : "Предупр."}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <code className="font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                        {error.ipAddress || "Unknown IP"}
                      </code>
                      <span className="font-bold text-slate-400">
                        {getTimeAgo(error.createdAt)}
                      </span>
                    </div>
                  </div>
                )}
                renderTable={() => (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-rose-50/30">
                          <th className="px-6 py-4 text-[10px] font-bold text-rose-400  tracking-normal">Сообщение об ошибке</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-rose-400  tracking-normal">Критичность</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-rose-400  tracking-normal">IP / Путь</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-rose-400  tracking-normal">Дата</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-50">
                        {securityData?.systemErrors.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-16 text-center text-emerald-600 font-bold text-[10px]  tracking-normal">
                              <Zap className="w-8 h-8 mx-auto mb-3 opacity-20" />
                              Ошибок не выявлено
                            </td>
                          </tr>
                        ) : (
                          securityData?.systemErrors.map((error) => (
                            <tr
                              key={error.id}
                              className="hover:bg-rose-50/50 transition-colors group cursor-pointer"
                              onClick={() => setSelectedError(error)}
                            >
                              <td className="px-6 py-4 max-w-md">
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500 animate-pulse" />
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900 leading-tight">
                                      {translateErrorMessage(error.message)}
                                    </p>
                                    {error.path && (
                                      <p className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                                        <span className="bg-slate-100 px-1 rounded font-bold text-slate-500">{error.method || 'REQ'}</span>
                                        <span className="truncate">{error.path}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-[18px] text-[9px] font-bold  tracking-tight",
                                  error.severity === "critical" ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-600"
                                )}>
                                  {error.severity === "critical" ? "Критично" : "Предупреждение"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <code className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                                    {error.ipAddress || "Unknown IP"}
                                  </code>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-900 ">
                                    {getTimeAgo(error.createdAt)}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400">
                                    {new Date(error.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "diagnostics" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 px-1">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">
                    Самодиагностика системы
                  </CardTitle>
                  <CardDescription className="text-xs font-bold  tracking-wider text-slate-400">
                    Проверка целостности и связи с сервисами
                  </CardDescription>
                </div>
                <button
                  onClick={runDiagnostics}
                  disabled={diagnosing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-[18px] hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw
                    size={14}
                    className={cn(diagnosing && "animate-spin")}
                  />
                  {diagnosing ? "Проверка..." : "Запустить тест"}
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!healthData && !diagnosing ? (
                <div className="py-12 text-center">
                  <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    Нажмите кнопку выше, чтобы проверить состояние систем.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* DB */}
                    <div
                      className={cn(
                        "p-4 rounded-[18px] border transition-all",
                        healthData?.database.status === "ok"
                          ? "bg-emerald-50/30 border-emerald-100"
                          : "bg-slate-50/50 border-slate-200",
                        diagnosing && "animate-pulse",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-1.5 rounded-[18px]",
                              healthData?.database.status === "ok"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-200 text-slate-500",
                            )}
                          >
                            <Database size={16} />
                          </div>
                          <span className="font-bold text-slate-700">
                            База данных
                          </span>
                        </div>
                        {healthData?.database.status === "ok" ? (
                          <span className="text-[10px] font-bold  text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            OK
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold  text-slate-400">
                            ...
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] text-slate-400 font-bold  tracking-normal mb-1">
                          Задержка (Latency)
                        </p>
                        <p className="text-lg font-bold text-slate-800">
                          {healthData?.database.latency ?? "0"}{" "}
                          <span className="text-xs text-slate-400">ms</span>
                        </p>
                      </div>
                    </div>

                    {/* Storage */}
                    <div
                      className={cn(
                        "p-4 rounded-[18px] border transition-all",
                        healthData?.storage.status === "ok"
                          ? "bg-emerald-50/30 border-emerald-100"
                          : healthData?.storage.status === "error"
                            ? "bg-red-50/30 border-red-100"
                            : "bg-slate-50/50 border-slate-200",
                        diagnosing && "animate-pulse",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-1.5 rounded-[18px]",
                              healthData?.storage.status === "ok"
                                ? "bg-emerald-100 text-emerald-600"
                                : healthData?.storage.status === "error"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-slate-200 text-slate-500",
                            )}
                          >
                            <HardDrive size={16} />
                          </div>
                          <span className="font-bold text-slate-700">
                            S3 Хранилище
                          </span>
                        </div>
                        {healthData?.storage.status === "ok" ? (
                          <span className="text-[10px] font-bold  text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Доступно
                          </span>
                        ) : healthData?.storage.status === "error" ? (
                          <span className="text-[10px] font-bold  text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            Ошибка
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold  text-slate-400">
                            ...
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] text-slate-400 font-bold  tracking-normal mb-1">
                          Состояние
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          {healthData?.storage.status === "ok"
                            ? "Запись и чтение успешно"
                            : "Ожидание..."}
                        </p>
                      </div>
                    </div>

                    {/* Env Vars */}
                    <div
                      className={cn(
                        "p-4 rounded-[18px] border transition-all",
                        healthData?.env.status === "ok"
                          ? "bg-emerald-50/30 border-emerald-100"
                          : healthData?.env.status === "warning"
                            ? "bg-amber-50/30 border-amber-100"
                            : "bg-slate-50/50 border-slate-200",
                        diagnosing && "animate-pulse",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-1.5 rounded-[18px]",
                              healthData?.env.status === "ok"
                                ? "bg-emerald-100 text-emerald-600"
                                : healthData?.env.status === "warning"
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-slate-200 text-slate-500",
                            )}
                          >
                            <Zap size={16} />
                          </div>
                          <span className="font-bold text-slate-700">
                            Окружение
                          </span>
                        </div>
                        {healthData?.env.status === "ok" ? (
                          <span className="text-[10px] font-bold  text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            OK
                          </span>
                        ) : healthData?.env.status === "warning" ? (
                          <span className="text-[10px] font-bold  text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            WARN
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold  text-slate-400">
                            ...
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] text-slate-400 font-bold  tracking-normal mb-1">
                          Критические ключи
                        </p>
                        <p className="text-xs text-slate-600 font-bold truncate">
                          {healthData?.env.status === "ok"
                            ? "Все переменные на месте"
                            : healthData?.env.details.length
                              ? `Мимо: ${healthData.env.details.join(", ")} `
                              : "Ожидание..."}
                        </p>
                      </div>
                    </div>

                    {/* File System */}
                    <div
                      className={cn(
                        "p-4 rounded-[18px] border transition-all",
                        healthData?.fs.status === "ok"
                          ? "bg-emerald-50/30 border-emerald-100"
                          : healthData?.fs.status === "error"
                            ? "bg-red-50/30 border-red-100"
                            : "bg-slate-50/50 border-slate-200",
                        diagnosing && "animate-pulse",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-1.5 rounded-[18px]",
                              healthData?.fs.status === "ok"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-200 text-slate-500",
                            )}
                          >
                            <HardDrive size={16} />
                          </div>
                          <span className="font-bold text-slate-700">
                            Файловая система
                          </span>
                        </div>
                        {healthData?.fs.status === "ok" ? (
                          <span className="text-[10px] font-bold  text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            OK
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold  text-slate-400">
                            ...
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] text-slate-400 font-bold  tracking-normal mb-1">
                          Права на запись
                        </p>
                        <p className="text-xs text-slate-600 font-bold">
                          {healthData?.fs.status === "ok"
                            ? "Подтверждены (uploads/)"
                            : "Ожидание..."}
                        </p>
                      </div>
                    </div>

                    {/* Backups */}
                    <div
                      className={cn(
                        "p-4 rounded-[18px] border transition-all",
                        healthData?.backup.status === "ok"
                          ? "bg-emerald-50/30 border-emerald-100"
                          : healthData?.backup.status === "warning"
                            ? "bg-amber-50/30 border-amber-100"
                            : "bg-slate-50/50 border-slate-200",
                        diagnosing && "animate-pulse",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-1.5 rounded-[18px]",
                              healthData?.backup.status === "ok"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-200 text-slate-500",
                            )}
                          >
                            <History size={16} />
                          </div>
                          <span className="font-bold text-slate-700">
                            Бэкапы
                          </span>
                        </div>
                        {healthData?.backup.status === "ok" ? (
                          <span className="text-[10px] font-bold  text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Валидны
                          </span>
                        ) : healthData?.backup.status === "none" ? (
                          <span className="text-[10px] font-bold  text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Пусто
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold  text-slate-400">
                            ...
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] text-slate-400 font-bold  tracking-normal mb-1">
                          Последний архив
                        </p>
                        <p className="text-xs text-slate-600 font-bold">
                          {healthData?.backup.status === "ok"
                            ? "Целостность проверена"
                            : healthData?.backup.status === "none"
                              ? "Копии не найдены"
                              : "Ожидание..."}
                        </p>
                      </div>
                    </div>

                    {/* JWT */}
                    <div
                      className={cn(
                        "p-4 rounded-[18px] border transition-all",
                        healthData?.jwt.status === "ok"
                          ? "bg-emerald-50/30 border-emerald-100"
                          : healthData?.jwt.status === "error"
                            ? "bg-red-50/30 border-red-100"
                            : "bg-slate-50/50 border-slate-200",
                        diagnosing && "animate-pulse",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-1.5 rounded-[18px]",
                              healthData?.jwt.status === "ok"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-200 text-slate-500",
                            )}
                          >
                            <ShieldCheck size={16} />
                          </div>
                          <span className="font-bold text-slate-700">
                            JWT Auth
                          </span>
                        </div>
                        {healthData?.jwt.status === "ok" ? (
                          <span className="text-[10px] font-bold  text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            OK
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold  text-slate-400">
                            ...
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] text-slate-400 font-bold  tracking-normal mb-1">
                          Криптография
                        </p>
                        <p className="text-xs text-slate-600 font-bold">
                          {healthData?.jwt.status === "ok"
                            ? "JOSE Тест успешно"
                            : "Ожидание..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {healthData && (
                    <div className="mt-8 rounded-[18px] overflow-hidden border border-slate-800 shadow-2xl shadow-indigo-900/10">
                      <div className="bg-slate-900/95 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="text-[10px] font-bold  tracking-normal text-slate-500">
                          System Core Output
                        </div>
                      </div>
                      <div className="bg-black/90 backdrop-blur-xl p-5 font-mono text-[11px] leading-relaxed">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                          <span className="text-emerald-500/50 font-bold">
                            ●
                          </span>
                          <span className="text-slate-500  tracking-normal font-bold">
                            Log Archive:{" "}
                            {new Date(healthData.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-300">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 font-bold">01</span>
                            <span className="text-indigo-400">
                              DATABASE_CONNECTIVITY:
                            </span>
                            <span
                              className={cn(
                                "font-bold ",
                                healthData.database.status === "ok"
                                  ? "text-emerald-400"
                                  : "text-rose-400",
                              )}
                            >
                              {healthData.database.status.toUpperCase()}
                            </span>
                            <span className="text-slate-500">
                              ({healthData.database.latency}ms)
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 font-bold">02</span>
                            <span className="text-indigo-400">
                              STORAGE_IO_TEST:
                            </span>
                            <span
                              className={cn(
                                "font-bold ",
                                healthData.storage.status === "ok"
                                  ? "text-emerald-400"
                                  : "text-rose-400",
                              )}
                            >
                              {healthData.storage.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 font-bold">03</span>
                            <span className="text-indigo-400">
                              ENVIRONMENT_VARIABLES:
                            </span>
                            <span
                              className={cn(
                                "font-bold ",
                                healthData.env.status === "ok"
                                  ? "text-emerald-400"
                                  : "text-amber-400",
                              )}
                            >
                              {healthData.env.status === "ok"
                                ? "COMPLETED"
                                : "WARNING"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 font-bold">04</span>
                            <span className="text-indigo-400">
                              FILE_SYSTEM_PERMISSIONS:
                            </span>
                            <span
                              className={cn(
                                "font-bold ",
                                healthData.fs.status === "ok"
                                  ? "text-emerald-400"
                                  : "text-rose-400",
                              )}
                            >
                              {healthData.fs.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 font-bold">05</span>
                            <span className="text-indigo-400">
                              BACKUP_INTEGRITY_CHECK:
                            </span>
                            <span
                              className={cn(
                                "font-bold ",
                                healthData.backup.status === "ok"
                                  ? "text-emerald-400"
                                  : "text-slate-400",
                              )}
                            >
                              {healthData.backup.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600 font-bold">06</span>
                            <span className="text-indigo-400">
                              JWT_AUTH_VERIFICATION:
                            </span>
                            <span
                              className={cn(
                                "font-bold ",
                                healthData.jwt.status === "ok"
                                  ? "text-emerald-400"
                                  : "text-rose-400",
                              )}
                            >
                              {healthData.jwt.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 pt-2 mt-2 border-t border-white/5">
                            <span className="text-slate-600 font-bold">07</span>
                            <span className="text-slate-300 font-bold tracking-wider">
                              &gt; TOTAL_SYSTEM_STABILITY:
                            </span>
                            <span
                              className={cn(
                                "font-bold animate-pulse",
                                healthData.database.status === "ok" &&
                                  healthData.storage.status === "ok"
                                  ? "text-emerald-400"
                                  : "text-amber-400",
                              )}
                            >
                              {healthData.database.status === "ok" &&
                                healthData.storage.status === "ok"
                                ? "EXCELLENT"
                                : "STABLE_WITH_WARNS"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "backups" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 px-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-slate-800">
                Резервное копирование
              </h4>
              <p className="text-xs font-bold  tracking-wider text-slate-400">
                Локальные JSON-копии всей базы данных
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold  tracking-normal text-slate-400 mr-1">
                Автоматическое создание:
              </span>
              <div className="flex bg-slate-100 p-1 rounded-[18px] mr-2">
                {[
                  { id: "none", label: "Выкл" },
                  { id: "daily", label: "Сутки" },
                  { id: "weekly", label: "Неделя" },
                  { id: "monthly", label: "Месяц" },
                ].map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => updateSetting("backup_frequency", freq.id)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-bold  tracking-wider rounded-[18px] transition-all",
                      settings.backup_frequency === freq.id
                        ? "bg-white text-#5d00ff shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="flex items-center gap-2 px-6 py-2.5 bg-#5d00ff text-white text-xs font-bold rounded-[18px] hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-100"
              >
                <History
                  size={14}
                  className={cn(creatingBackup && "animate-spin")}
                />
                {creatingBackup ? "Создание..." : "Создать бэкап"}
              </button>
            </div>
          </div>

          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loadingBackups ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    Загрузка списка копий...
                  </p>
                </div>
              ) : (
                <ResponsiveDataView
                  data={backups || []}
                  renderCard={(backup, idx) => (
                    <div key={backup.name || idx} className="p-4 bg-white border border-slate-100 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
                          <FileJson size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{backup.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatSize(backup.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-[10px] font-medium text-slate-500">{new Date(backup.createdAt).toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <a
                            href={`/uploads/backups/${backup.name}`}
                            download
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => setBackupToDelete(backup.name)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  renderTable={() => (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold  text-slate-400 tracking-normal">
                              Имя файла
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold  text-slate-400 tracking-normal">
                              Размер
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold  text-slate-400 tracking-normal text-right">
                              Дата создания
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold  text-slate-400 tracking-normal text-right">
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {backups.map((backup) => (
                            <tr
                              key={backup.name}
                              className="border-b border-slate-200 hover:bg-slate-50/30 transition-colors group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-[18px] bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                                    <FileJson size={16} />
                                  </div>
                                  <span className="text-sm font-bold text-slate-700">
                                    {backup.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-slate-500">
                                  {formatSize(backup.size)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-xs font-medium text-slate-500">
                                  {new Date(backup.createdAt).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 text-slate-400">
                                  <a
                                    href={`/uploads/backups/${backup.name}`}
                                    download
                                    className="p-2 hover:text-#5d00ff hover:bg-indigo-50 rounded-[18px] transition-all"
                                    title="Скачать"
                                  >
                                    <Download size={16} />
                                  </a>
                                  <button
                                    onClick={() => setBackupToDelete(backup.name)}
                                    className="p-2 hover:text-red-600 hover:bg-red-50 rounded-[18px] transition-all"
                                    title="Удалить"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-100 rounded-[18px] p-4 flex gap-4">
            <div className="p-2 rounded-[18px] bg-amber-100 text-amber-600 h-fit">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900  tracking-wider mb-1">
                Важная информация
              </p>
              <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                Резервные копии сохраняются локально на сервере в папке{" "}
                <code className="bg-amber-100/50 px-1 rounded">
                  uploads/backups
                </code>
                . В случае переустановки системы рекомендуется скачивать важные
                копии на локальный компьютер. Данные выгружаются в формате JSON,
                что позволяет восстановить их даже без прямого доступа к
                PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "action_log" && (
        <div className="animate-in fade-in duration-300">
          <AuditLogsTable isAdmin={isAdmin} />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!backupToDelete}
        onClose={() => setBackupToDelete(null)}
        onConfirm={handleDeleteBackup}
        title="Удалить резервную копию?"
        description={`Вы собираетесь навсегда удалить файл ${backupToDelete}. Это действие нельзя отменить.`}
      />

      {
        isRestarting && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[18px] shadow-2xl max-w-md w-full text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-#5d00ff border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Server className="w-8 h-8 text-#5d00ff" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Обновление системы
                </h3>
                <p className="text-slate-500 font-medium">
                  Сервер перезагружается. Это займет от 10 до 30 секунд.
                </p>
              </div>
              <div className="bg-slate-50 rounded-[18px] p-4 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700  tracking-wider">
                    Статус подключения
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  &gt; Waiting for server response...
                  <br />
                  &gt; Reconnecting to dashboard...
                </p>
              </div>
              <p className="text-[10px] text-slate-400 font-bold  tracking-normal animate-pulse">
                Не закрывайте эту страницу
              </p>
            </div>
          </div>
        )
      }

      <ConfirmDialog
        isOpen={showRestartConfirm}
        onClose={() => setShowRestartConfirm(false)}
        onConfirm={handleRestart}
        title="Перезагрузить сервер приложений?"
        description="Это действие прервет все активные сессии и сделает CRM недоступной на 10-30 секунд. Вы точно уверены?"
      />
      {/* Error Details Dialog */}
      <ResponsiveModal
        isOpen={!!selectedError}
        onClose={() => setSelectedError(null)}
        title="Детали ошибки"
        description="Техническая информация о сбое"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="space-y-2 px-6">
            <label className="text-[10px] font-bold text-slate-400  tracking-normal">Сообщение (перевод)</label>
            <div className="p-4 bg-rose-50 rounded-[18px] border border-rose-100 text-rose-800 font-bold text-sm">
              {selectedError && translateErrorMessage(selectedError.message)}
            </div>
          </div>

          <div className="space-y-2 px-6">
            <label className="text-[10px] font-bold text-slate-400  tracking-normal">Оригинальное сообщение</label>
            <div className="p-4 bg-slate-50 rounded-[18px] border border-slate-200 font-mono text-xs text-slate-600 break-words whitespace-pre-wrap">
              {selectedError?.message}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 pb-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400  tracking-normal">Путь / Метод</label>
              <div className="font-bold text-slate-700 text-sm">
                {selectedError?.method || "-"} {selectedError?.path || "-"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400  tracking-normal">IP Адрес</label>
              <div className="font-bold text-slate-700 text-sm">
                {selectedError?.ipAddress || "Не определен"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400  tracking-normal">Критичность</label>
              <div className={cn(
                "inline-flex px-2 py-0.5 rounded-[18px] text-[10px] font-bold  tracking-tight",
                selectedError?.severity === "critical" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
              )}>
                {selectedError?.severity === "critical" ? "Критическая" : "Предупреждение"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400  tracking-normal">Время возникновения</label>
              <div className="font-bold text-slate-700 text-sm">
                {selectedError?.createdAt ? new Date(selectedError.createdAt).toLocaleString("ru-RU") : "-"}
              </div>
            </div>
          </div>
        </div>
      </ResponsiveModal>
    </div >
  );
}

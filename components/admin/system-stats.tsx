
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


  clearRamAction,
  restartServerAction,
  getCurrentUserAction,
  clearSecurityErrors,
  clearFailedLogins,
} from "@/app/(main)/admin-panel/actions";
import { AuditLogsTable } from "./audit-logs-table";
import {
  Activity as ActivityIcon,
  Download,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MonitoringTab } from "./tabs/monitoring-tab";
import { SecurityTab } from "./tabs/security-tab";
import { DiagnosticsTab } from "./tabs/diagnostics-tab";
import { BackupsTab } from "./tabs/backups-tab";

import {
  StatsData,
  HealthData,
  BackupFile,
  MonitoringData,
  SecurityData
} from "./types";

export function SystemStats() {
  const { toast } = useToast();
  const [uiState, setUiState] = useState({
    loading: true,
    error: null as string | null,
    lastUpdated: new Date(),
    activeTab: "monitoring" as "monitoring" | "diagnostics" | "backups" | "security" | "action_log",
    showRestartConfirm: false,
    isRestarting: false,
    isAdmin: false
  });

  const [monitoring, setMonitoring] = useState({
    stats: null as StatsData | null,
    data: null as MonitoringData | null,
    clearingRam: false,
    restarting: false
  });

  const [security, setSecurity] = useState({
    data: null as SecurityData | null,
    togglingMaintenance: false,
    clearingErrors: false,
    clearingLogins: false
  });

  const [backups, setBackups] = useState({
    list: [] as BackupFile[],
    creating: false
  });

  const [diagnostics, setDiagnostics] = useState({
    healthData: null as HealthData | null,
    diagnosing: false
  });

  // Poll server availability
  useEffect(() => {
    if (!uiState.isRestarting) return;

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
  }, [uiState.isRestarting]);

  const fetchStats = useCallback(async (manual = false) => {
    if (manual) {
      setUiState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Basic stats always needed
      const res = await getSystemStats();
      if (res.data) {
        setMonitoring(prev => ({ ...prev, stats: res.data as StatsData }));
        setUiState(prev => ({ ...prev, lastUpdated: new Date() }));
      } else if (res.error) {
        setUiState(prev => ({ ...prev, error: res.error || "" }));
      }

      // Tab-specific loading
      if (uiState.activeTab === "monitoring") {
        const start = performance.now();
        const monRes = await getMonitoringStats();
        const end = performance.now();

        if (monRes.success && monRes.data) {
          setMonitoring(prev => ({
            ...prev,
            data: {
              activeUsers: monRes.data?.activeUsers || [],
              activityStats: monRes.data?.activityStats || [],
              entityStats: monRes.data?.entityStats || [],
              performance: Math.round(end - start),
            }
          } as unknown as { stats: StatsData | null, data: MonitoringData | null, clearingRam: boolean, restarting: boolean }));
        }
      } else if (uiState.activeTab === "security") {
        const secRes = await getSecurityStats();
        if (secRes.success && secRes.data) {
          setSecurity(prev => ({ ...prev, data: secRes.data as unknown as SecurityData }));
        }
      } else if (uiState.activeTab === "backups") {
        const backRes = await getBackupsList();
        if (backRes.data) {
          setBackups(prev => ({ ...prev, list: backRes.data as BackupFile[] }));
        }
      }
    } catch (e) {
      console.error("Fetch stats error:", e);
      if (manual) setUiState(prev => ({ ...prev, error: "Ошибка сети или сервера" }));
    } finally {
      if (manual) setUiState(prev => ({ ...prev, loading: false }));
    }
  }, [uiState.activeTab]);

  // Combined effect for initialization, tab changes, and polling
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!uiState.isAdmin) {
        try {
          const userRes = await getCurrentUserAction();
          if (isMounted && userRes.data?.role?.name === "Администратор") {
            setUiState(prev => ({ ...prev, isAdmin: true }));
          }
        } catch (e) {
          console.error("Admin check error:", e);
        }
      }
      if (isMounted) fetchStats();
    };

    init();

    const interval = setInterval(() => {
      if (isMounted) fetchStats();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchStats, uiState.isAdmin]);

  const handleToggleMaintenance = async (enabled: boolean) => {
    setSecurity(prev => ({ ...prev, togglingMaintenance: true }));
    try {
      const res = await toggleMaintenanceMode(enabled);
      if (res.success) {
        toast(
          `Режим обслуживания ${enabled ? "включен" : "выключен"} `,
          "success",
        );
        fetchStats();
      } else {
        toast(res.error || "Ошибка", "error");
      }
    } catch {
      toast("Ошибка сети", "error");
    } finally {
      setSecurity(prev => ({ ...prev, togglingMaintenance: false }));
    }
  };

  const handleClearSecurityErrors = async () => {
    setSecurity(prev => ({ ...prev, clearingErrors: true }));
    try {
      const res = await clearSecurityErrors();
      if (res.success) {
        toast("Список ошибок успешно очищен", "success");
        fetchStats();
      } else {
        toast(res.error || "Ошибка", "error");
      }
    } catch {
      toast("Ошибка сети", "error");
    } finally {
      setSecurity(prev => ({ ...prev, clearingErrors: false }));
    }
  };

  const handleClearFailedLogins = async () => {
    setSecurity(prev => ({ ...prev, clearingLogins: true }));
    try {
      const res = await clearFailedLogins();
      if (res.success) {
        toast("Список попыток входа очищен", "success");
        fetchStats();
      } else {
        toast(res.error || "Ошибка", "error");
      }
    } catch {
      toast("Ошибка сети", "error");
    } finally {
      setSecurity(prev => ({ ...prev, clearingLogins: false }));
    }
  };

  const runDiagnostics = async () => {
    setDiagnostics(prev => ({ ...prev, diagnosing: true }));
    const res = await checkSystemHealth();
    if (res.data) {
      setDiagnostics(prev => ({ ...prev, healthData: res.data as HealthData }));
      toast("Параметры системы успешно проверены", "success");
    } else if (res.error) {
      toast(res.error, "error");
    }
    setDiagnostics(prev => ({ ...prev, diagnosing: false }));
  };

  const handleCreateBackup = async () => {
    setBackups(prev => ({ ...prev, creating: true }));
    const res = await createDatabaseBackup();
    if (res.success) {
      toast(`Резервная копия ${(res as { fileName?: string }).fileName} создана`, "success");
      fetchStats();
    } else if (res.error) {
      toast(res.error, "error");
    }
    setBackups(prev => ({ ...prev, creating: false }));
  };

  const handleDeleteBackup = async (name: string) => {
    try {
      await deleteBackupAction(name);
      toast(`Бэкап ${name} удален`, "success");
      fetchStats();
    } catch {
      toast("Не удалось удалить файл резервной копии", "error");
    }
  };


  const handleClearRam = async () => {
    setMonitoring(prev => ({ ...prev, clearingRam: true }));
    const res = await clearRamAction();
    if (res.success) {
      toast(res.message || "RAM очищена", "success");
      fetchStats();
    } else {
      toast(res.error || "Ошибка", "error");
    }
    setMonitoring(prev => ({ ...prev, clearingRam: false }));
  };

  const handleRestart = async () => {
    setMonitoring(prev => ({ ...prev, restarting: true }));
    setUiState(prev => ({ ...prev, showRestartConfirm: false }));
    const res = await restartServerAction();
    if (res.success) {
      toast(res.message || "Перезапуск...", "success");
      setUiState(prev => ({ ...prev, isRestarting: true }));
    } else {
      toast(res.error || "Ошибка", "error");
      setMonitoring(prev => ({ ...prev, restarting: false }));
    }
  };



  return (
    <div className="space-y-3">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-10 opacity-50" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 bg-indigo-50 text-[#5d00ff] rounded-[24px] shadow-sm shadow-indigo-100">
            <ActivityIcon size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Состояние системы
            </h2>
            <p className="text-sm font-bold text-slate-400">
              Мониторинг ресурсов и диагностика
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {uiState.activeTab === "backups" && (
            <Button
              onClick={handleCreateBackup}
              disabled={backups.creating}
              className="rounded-[18px] bg-[#5d00ff] hover:bg-[#4b00cc] text-white shadow-lg shadow-indigo-200 font-bold transition-all active:scale-95"
            >
              <Download size={16} className={cn("mr-2", backups.creating && "animate-bounce")} />
              {backups.creating ? "Создание..." : "Создать бэкап"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2 no-scrollbar">
        <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-[24px] border border-slate-200">
          <Button
            variant="ghost"
            onClick={() => setUiState(prev => ({ ...prev, activeTab: "monitoring" }))}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all h-8",
              uiState.activeTab === "monitoring"
                ? "bg-white text-[#5d00ff] shadow-sm hover:bg-white hover:text-[#5d00ff]"
                : "text-slate-500 hover:text-slate-700 bg-transparent"
            )}
          >
            Мониторинг
          </Button>
          <Button
            variant="ghost"
            onClick={() => setUiState(prev => ({ ...prev, activeTab: "diagnostics" }))}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all h-8",
              uiState.activeTab === "diagnostics"
                ? "bg-white text-[#5d00ff] shadow-sm hover:bg-white hover:text-[#5d00ff]"
                : "text-slate-500 hover:text-slate-700 bg-transparent"
            )}
          >
            Диагностика
          </Button>
          <Button
            variant="ghost"
            onClick={() => setUiState(prev => ({ ...prev, activeTab: "backups" }))}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all h-8",
              uiState.activeTab === "backups"
                ? "bg-white text-[#5d00ff] shadow-sm hover:bg-white hover:text-[#5d00ff]"
                : "text-slate-500 hover:text-slate-700 bg-transparent"
            )}
          >
            Бэкапы
          </Button>
          <Button
            variant="ghost"
            onClick={() => setUiState(prev => ({ ...prev, activeTab: "security" }))}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all h-8",
              uiState.activeTab === "security"
                ? "bg-white text-[#5d00ff] shadow-sm hover:bg-white hover:text-[#5d00ff]"
                : "text-slate-500 hover:text-slate-700 bg-transparent"
            )}
          >
            Безопасность
          </Button>
          <Button
            variant="ghost"
            onClick={() => setUiState(prev => ({ ...prev, activeTab: "action_log" }))}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-[18px] transition-all h-8",
              uiState.activeTab === "action_log"
                ? "bg-white text-[#5d00ff] shadow-sm hover:bg-white hover:text-[#5d00ff]"
                : "text-slate-500 hover:text-slate-700 bg-transparent"
            )}
          >
            Лог действий
          </Button>
        </div>
      </div>

      {uiState.activeTab === "monitoring" && (
        <MonitoringTab
          stats={monitoring.stats}
          monitoringData={monitoring.data}
          loading={uiState.loading}
          error={uiState.error}
          lastUpdated={uiState.lastUpdated}
          onRefresh={fetchStats}
          onClearRam={handleClearRam}
          isClearingRam={monitoring.clearingRam}
          onRestartRequest={() => setUiState(prev => ({ ...prev, showRestartConfirm: true }))}
          isRestartingAction={monitoring.restarting}
        />
      )}

      {uiState.activeTab === "security" && (
        <SecurityTab
          securityData={security.data}
          onRefresh={fetchStats}
          onToggleMaintenance={handleToggleMaintenance}
          isTogglingMaintenance={security.togglingMaintenance}
          onClearFailedLogins={handleClearFailedLogins}
          isClearingLogins={security.clearingLogins}
          onClearSecurityErrors={handleClearSecurityErrors}
          isClearingErrors={security.clearingErrors}
        />
      )}

      {uiState.activeTab === "diagnostics" && (
        <DiagnosticsTab
          healthData={diagnostics.healthData}
          diagnosing={diagnostics.diagnosing}
          onRunDiagnostics={runDiagnostics}
        />
      )}

      {uiState.activeTab === "backups" && (
        <BackupsTab
          backups={backups.list}
          onDeleteBackup={handleDeleteBackup}
          isDeleting={false}
        />
      )}

      {uiState.activeTab === "action_log" && (
        <div className="animate-in fade-in duration-300">
          <AuditLogsTable isAdmin={uiState.isAdmin} />
        </div>
      )}

      {uiState.isRestarting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-[18px] shadow-2xl max-w-md w-full text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#5d00ff] border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Server className="w-8 h-8 text-[#5d00ff]" />
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
                <span className="text-xs font-bold text-slate-700 ">
                  Статус подключения
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                &gt; Waiting for server response...
                <br />
                &gt; Reconnecting to dashboard...
              </p>
            </div>
            <p className="text-xs text-slate-400 font-bold  animate-pulse">
              Не закрывайте эту страницу
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={uiState.showRestartConfirm}
        onClose={() => setUiState(prev => ({ ...prev, showRestartConfirm: false }))}
        onConfirm={handleRestart}
        title="Перезагрузить сервер приложений?"
        description="Это действие прервет все активные сессии и сделает CRM недоступной на 10-30 секунд. Вы точно уверены?"
      />
    </div>
  );
}

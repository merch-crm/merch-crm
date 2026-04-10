"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Download, Archive, Trash2, X, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { bulkUpdateClientManager, bulkArchiveClients, bulkDeleteClients } from "../actions/bulk.actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { undoLastAction } from "../../undo-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ClientBulkActionsProps {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  managers: { id: string; name: string }[];
  userRoleName?: string | null;
  fetchClients: () => void;
  handleExportClick: () => void;
  showArchived: boolean;
  mounted: boolean;
}

export function ClientBulkActions({
  selectedIds,
  setSelectedIds,
  managers,
  userRoleName,
  fetchClients,
  handleExportClick,
  showArchived,
  mounted
}: ClientBulkActionsProps) {
  const { toast } = useToast();
  const [showManagerSelect, setShowManagerSelect] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const handleBulkDelete = async () => {
    setIsBulkUpdating(true);
    setShowDeleteConfirm(false);
    const res = await bulkDeleteClients(selectedIds);
    setIsBulkUpdating(false);
    if (res.success) {
      toast("Удалено:" + selectedIds.length, "success", {
        action: {
          label: "Отменить",
          onClick: async () => {
            const undoRes = await undoLastAction();
            if (undoRes.success) {
              toast("Действие отменено", "success");
              playSound("notification_success");
              fetchClients();
            } else {
              toast(undoRes.error || "Ошибка", "error");
            }
          }
        }
      });
      playSound("client_deleted");
      setSelectedIds([]);
      fetchClients();
    } else {
      toast(res.error || "Ошибка", "error");
    }
  };

  const handleBulkArchive = async () => {
    setIsBulkUpdating(true);
    const res = await bulkArchiveClients(selectedIds, !showArchived);
    setIsBulkUpdating(false);
    if (res?.success) {
      toast(showArchived ? "Восстановлено" : "Архивировано", "success");
      setSelectedIds([]);
      fetchClients();
    } else {
      toast(res?.error || "Ошибка", "error");
    }
  };

  if (!mounted || selectedIds.length === 0) return null;

  return (
    <>
      {createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
            className="fixed bottom-10 left-1/2 z-[100] flex items-center bg-white p-2.5 px-8 gap-3 rounded-full shadow-2xl border border-slate-200"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                {selectedIds.length}
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <div className="flex items-center gap-1">
              {["Администратор", "Управляющий", "Отдел продаж"].includes(userRoleName || "") && (
                <Button type="button" variant="ghost" onClick={handleExportClick} className="h-9 px-4 rounded-full text-xs font-bold">
                  <Download className="w-3.5 h-3.5 mr-2" /> Экспорт
                </Button>
              )}

              <div className="relative">
                <Button type="button" onClick={() => setShowManagerSelect(!showManagerSelect)}
                  className={cn("h-9 px-4 rounded-full text-xs font-bold", showManagerSelect ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600")}
                >
                  <UsersIcon className="w-3.5 h-3.5 mr-2" /> Менеджер
                </Button>

                {showManagerSelect && (
                  <div className="absolute bottom-full left-0 mb-4 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[110]">
                    <div className="px-3 py-2 text-xs font-bold text-slate-400">Выбор менеджера</div>
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await bulkUpdateClientManager(selectedIds, "");
                          if (res.success) {
                            toast("Обновлено", "success");
                            setSelectedIds([]);
                            fetchClients();
                          }
                          setShowManagerSelect(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold"
                      >
                        Без менеджера
                      </button>
                      {managers.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={async () => {
                            const res = await bulkUpdateClientManager(selectedIds, m.id);
                            if (res.success) {
                              toast(`Назначен: ${m.name}`, "success");
                              setSelectedIds([]);
                              fetchClients();
                            }
                            setShowManagerSelect(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold"
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {["Администратор", "Управляющий"].includes(userRoleName || "") && (
                <Button type="button" variant="ghost" onClick={handleBulkArchive} className="h-9 px-4 rounded-full text-xs font-bold hover:bg-amber-50 text-amber-600">
                  <Archive className="w-3.5 h-3.5 mr-2" /> В архив
                </Button>
              )}

              {userRoleName === "Администратор" && (
                <Button type="button" variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="h-9 px-4 rounded-full text-xs font-bold text-rose-500 hover:bg-rose-50">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Удалить
                </Button>
              )}

              <div className="w-px h-6 bg-slate-200 mx-1" />

              <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedIds([])} className="w-9 h-9 rounded-full bg-slate-100">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Удаление записей"
        description={`Вы уверены что хотите удалить выбраных клиентов? Это действие нельзя отменить.`}
        variant="destructive"
        confirmText="Удалить"
        isLoading={isBulkUpdating}
      />
    </>
  );
}

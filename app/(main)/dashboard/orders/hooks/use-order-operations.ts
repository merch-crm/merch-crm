"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { 
  updateOrderField as updateOrderFieldAction,
  archiveOrder as archiveOrderAction,
  deleteOrder as deleteOrderAction,
} from "../actions/core.actions";
import type { Order } from "@/lib/types/order";

export function useOrderActions() {
  const router = useRouter();
  const { toast } = useToast();

  const handleUpdateField = useCallback(async (
    orderId: string,
    field: string,
    value: string | number | boolean
  ): Promise<boolean> => {
    const result = await updateOrderFieldAction(orderId, field, value);

    if (!result.success) {
      toast(result.error, "error");
      playSound("notification_error");
      return false;
    }

    toast("Заказ обновлён", "success");
    playSound("notification_success");
    return true;
  }, [toast]);

  const handleArchive = useCallback(async (
    orderId: string,
    archive: boolean
  ): Promise<boolean> => {
    const result = await archiveOrderAction(orderId, archive);

    if (!result.success) {
      toast(result.error, "error");
      playSound("notification_error");
      return false;
    }

    toast(archive ? "Заказ архивирован" : "Заказ восстановлен", "success");
    playSound("notification_success");
    router.refresh();
    return true;
  }, [toast, router]);

  const handleDelete = useCallback(async (
    orderId: string
  ): Promise<boolean> => {
    const result = await deleteOrderAction(orderId);

    if (!result.success) {
      toast(result.error, "error");
      playSound("notification_error");
      return false;
    }

    toast("Заказ удалён", "success");
    playSound("notification_success");
    router.refresh();
    return true;
  }, [toast, router]);

  const handleExport = useCallback((
    ordersData: Order[],
    selectedIds: string[]
  ) => {
    const dataToExport = selectedIds.length > 0 
      ? ordersData.filter(o => selectedIds.includes(o.id))
      : ordersData;
      
    import("@/lib/export-utils").then(({ exportToCSV }) => {
      exportToCSV(dataToExport, `orders-export-${new Date().toISOString().split('T')[0]}`);
      toast("Экспорт завершён", "success");
      playSound("notification_success");
    });
  }, [toast]);

  return {
    handleUpdateField,
    handleArchive,
    handleDelete,
    handleExport,
  };
}

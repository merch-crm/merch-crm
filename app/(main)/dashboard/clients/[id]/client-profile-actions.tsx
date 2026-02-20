"use client";

import { useState } from "react";
import { Edit2, Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditClientDialog } from "../edit-client-dialog";
import { toggleClientArchived } from "../actions/core.actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { useRouter } from "next/navigation";
import { ClientProfile } from "@/lib/types";

interface ClientProfileActionsProps {
    client: ClientProfile;
}

export function ClientProfileActions({ client }: ClientProfileActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleToggleArchive = async () => {
        setIsArchiving(true);
        const res = await toggleClientArchived(client.id, !client.isArchived);
        setIsArchiving(false);
        if (res.success) {
            toast(client.isArchived ? "Клиент восстановлен" : "Клиент отправлен в архив", "success");
            playSound(client.isArchived ? "client_updated" : "client_deleted");
            router.refresh();
        } else {
            toast(res.error || "Ошибка", "error");
            playSound("notification_error");
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    className="rounded-2xl gap-2 border-slate-200 hover:bg-slate-50 transition-all"
                    onClick={() => setIsEditOpen(true)}
                >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Редактировать</span>
                </Button>

                <Button
                    variant="outline"
                    disabled={isArchiving}
                    className="rounded-2xl gap-2 border-slate-200 hover:bg-slate-50 transition-all text-slate-400 hover:text-rose-500"
                    onClick={handleToggleArchive}
                >
                    {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                    <span className="hidden sm:inline">{client.isArchived ? 'Восстановить' : 'В архив'}</span>
                </Button>
            </div>

            <EditClientDialog
                client={client}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />
        </>
    );
}

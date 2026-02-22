import { useState } from "react";
import { Download, FileJson, ShieldCheck, Trash2 } from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BackupFile } from "../types";
import { formatSize } from "../utils";

interface BackupsTabProps {
    backups: BackupFile[];
    onDeleteBackup: (name: string) => Promise<void>;
    isDeleting: boolean;
}

export function BackupsTab({
    backups,
    onDeleteBackup,
    isDeleting,
}: BackupsTabProps) {
    const [backupToDelete, setBackupToDelete] = useState<string | null>(null);

    const handleConfirmDelete = async () => {
        if (backupToDelete) {
            await onDeleteBackup(backupToDelete);
            setBackupToDelete(null);
        }
    };

    return (
        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300 px-1">
            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-[32px] border">
                <CardContent className="p-0">
                    {backups.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 font-bold text-sm">
                            Нет доступных резервных копий
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="crm-table">
                                <thead className="crm-thead">
                                    <tr>
                                        <th className="crm-th">Имя файла</th>
                                        <th className="crm-th">Размер</th>
                                        <th className="crm-th text-right">Дата создания</th>
                                        <th className="crm-th text-right">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="crm-tbody">
                                    {backups.map((backup) => (
                                        <tr key={backup.name} className="crm-tr">
                                            <td className="crm-td">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-[18px] bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                                                        <FileJson size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {backup.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="crm-td">
                                                <span className="text-xs font-bold text-slate-500">
                                                    {formatSize(backup.size)}
                                                </span>
                                            </td>
                                            <td className="crm-td text-right">
                                                <span className="text-xs font-medium text-slate-500">
                                                    {new Date(backup.createdAt).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="crm-td text-right">
                                                <div className="flex items-center justify-end gap-2 text-slate-400">
                                                    <a
                                                        href={`/uploads/backups/${backup.name}`}
                                                        download
                                                        className="p-2 hover:text-[#5d00ff] hover:bg-indigo-50 rounded-[18px] transition-all"
                                                        title="Скачать"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setBackupToDelete(backup.name)}
                                                        disabled={isDeleting}
                                                        className="hover:text-rose-600 hover:bg-red-50 rounded-[18px] h-8 w-8"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-100 rounded-[18px] p-4 flex gap-3">
                <div className="p-2 rounded-[18px] bg-amber-100 text-amber-600 h-fit">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-amber-900 mb-1">
                        Важная информация
                    </p>
                    <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                        Резервные копии сохраняются локально на сервере в папке{" "}
                        <code className="bg-amber-100/50 px-1 rounded">
                            uploads/backups
                        </code>
                        . В случае переустановки системы рекомендуется скачивать важные
                        копии на локальный компьютер. Данные выгружаются в формате JSON,
                        что позволяет восстановить их даже без прямого доступа к PostgreSQL.
                    </p>
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!backupToDelete}
                onClose={() => setBackupToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Удалить резервную копию?"
                description={`Вы собираетесь навсегда удалить файл ${backupToDelete}. Это действие нельзя отменить.`}
            />
        </div>
    );
}

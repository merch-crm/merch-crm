"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserPlus,
    Phone,
    Mail,
    Star,
    MoreHorizontal,
    Pencil,
    Trash2,
    Crown,
    Calculator,
    ShoppingCart,
    User,
    Send,
    Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
    getClientContacts,
    deleteClientContact,
    setPrimaryContact,
} from "../actions/contacts.actions";
import { ContactEditDialog } from "./contact-edit-dialog";
import type { ClientContact } from "@/lib/schema";

interface ClientContactsListProps {
    clientId: string;
    clientType: "b2c" | "b2b";
    className?: string;
}

// Иконки для ролей
const ROLE_CONFIG: Record<string, { icon: typeof User; label: string; color: string }> = {
    lpr: { icon: Crown, label: "ЛПР", color: "text-amber-600 bg-amber-100" },
    accountant: { icon: Calculator, label: "Бухгалтер", color: "text-blue-600 bg-blue-100" },
    buyer: { icon: ShoppingCart, label: "Закупщик", color: "text-emerald-600 bg-emerald-100" },
    other: { icon: User, label: "Контакт", color: "text-slate-600 bg-slate-100" },
};

export const ClientContactsList = memo(function ClientContactsList({
    clientId,
    clientType,
    className,
}: ClientContactsListProps) {
    const [contacts, setContacts] = useState<ClientContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [deletingContact, setDeletingContact] = useState<ClientContact | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const { toast } = useToast();

    // Загрузка контактов
    const loadContacts = useCallback(async () => {
        setLoading(true);
        const result = await getClientContacts(clientId);
        if (result.success && result.data) {
            setContacts(result.data);
        }
        setLoading(false);
    }, [clientId]);

    useEffect(() => {
        if (clientType === "b2b") {
            loadContacts();
        }
    }, [clientId, clientType, loadContacts]);

    // Не показываем для B2C
    if (clientType !== "b2b") {
        return null;
    }

    const handleSetPrimary = async (contactId: string) => {
        const result = await setPrimaryContact(contactId);
        if (result.success) {
            toast("Основной контакт назначен", "success");
            loadContacts();
        } else {
            toast(result.error || "Ошибка", "error");
        }
        setActiveMenu(null);
    };

    const handleDelete = async () => {
        if (!deletingContact) return;

        const result = await deleteClientContact(deletingContact.id);
        if (result.success) {
            toast("Контакт удалён", "success");
            loadContacts();
        } else {
            toast(result.error || "Ошибка", "error");
        }
        setDeletingContact(null);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Контактные лица</h3>
                    <p className="text-xs text-slate-500">
                        {contacts.length === 0
                            ? "Добавьте контакты организации"
                            : `${contacts.length} из 5 контактов`
                        }
                    </p>
                </div>
                {contacts.length < 5 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddDialogOpen(true)}
                        className="h-8 px-3 rounded-lg text-xs font-bold text-primary hover:bg-primary/10"
                    >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        Добавить
                    </Button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && contacts.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <UserPlus className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">Нет контактных лиц</p>
                    <p className="text-xs text-slate-400 mb-4">Добавьте контакты для связи с организацией</p>
                    <Button
                        type="button"
                        onClick={() => setIsAddDialogOpen(true)}
                        className="h-9 px-4 rounded-xl text-xs font-bold"
                    >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        Добавить контакт
                    </Button>
                </motion.div>
            )}

            {/* Contacts List */}
            {!loading && contacts.length > 0 && (
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {contacts.map((contact, index) => {
                            const roleConfig = ROLE_CONFIG[contact.role] || ROLE_CONFIG.other;
                            const RoleIcon = roleConfig.icon;

                            return (
                                <motion.div
                                    key={contact.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "relative p-4 rounded-xl border-2 transition-all group",
                                        contact.isPrimary
                                            ? "border-primary/20 bg-primary/5"
                                            : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                >
                                    {/* Primary Badge */}
                                    {contact.isPrimary && (
                                        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                                            Основной
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        {/* Role Icon */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                            roleConfig.color
                                        )}>
                                            <RoleIcon className="w-5 h-5" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {contact.name}
                                                </p>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-xs font-bold shrink-0",
                                                    roleConfig.color
                                                )}>
                                                    {roleConfig.label}
                                                </span>
                                            </div>

                                            {contact.position && (
                                                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" />
                                                    {contact.position}
                                                </p>
                                            )}

                                            {/* Contact Info */}
                                            <div className="flex flex-wrap gap-2">
                                                {contact.phone && (
                                                    <a
                                                        href={`tel:${contact.phone}`}
                                                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        {contact.phone}
                                                    </a>
                                                )}
                                                {contact.email && (
                                                    <a
                                                        href={`mailto:${contact.email}`}
                                                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        {contact.email}
                                                    </a>
                                                )}
                                                {contact.telegram && (
                                                    <a
                                                        href={`https://t.me/${contact.telegram.replace("@", "")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 px-2 py-1 bg-sky-100 hover:bg-sky-200 rounded-lg text-xs font-bold text-sky-600 transition-colors"
                                                    >
                                                        <Send className="w-3 h-3" />
                                                        {contact.telegram}
                                                    </a>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {contact.notes && (
                                                <p className="mt-2 text-xs text-slate-400 italic line-clamp-2">
                                                    {contact.notes}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions Menu */}
                                        <div className="relative">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setActiveMenu(activeMenu === contact.id ? null : contact.id)}
                                                className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>

                                            <AnimatePresence>
                                                {activeMenu === contact.id && (
                                                    <>
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveMenu(null)}
                                                        />
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20"
                                                        >
                                                            {!contact.isPrimary && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetPrimary(contact.id)}
                                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <Star className="w-3.5 h-3.5" />
                                                                    Сделать основным
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingContact(contact);
                                                                    setActiveMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                                Редактировать
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setDeletingContact(contact);
                                                                    setActiveMenu(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Удалить
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <ContactEditDialog
                isOpen={isAddDialogOpen || !!editingContact}
                onClose={() => {
                    setIsAddDialogOpen(false);
                    setEditingContact(null);
                }}
                clientId={clientId}
                contact={editingContact}
                onSuccess={() => {
                    setIsAddDialogOpen(false);
                    setEditingContact(null);
                    loadContacts();
                }}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingContact}
                onClose={() => setDeletingContact(null)}
                onConfirm={handleDelete}
                title="Удаление контакта"
                description={`Вы уверены, что хотите удалить контакт "${deletingContact?.name}"?`}
                variant="destructive"
                confirmText="Удалить"
            />
        </div>
    );
});

"use client";

import { useState, useEffect, memo } from "react";
import { Loader2, User, Phone, Mail, Briefcase, Send, FileText } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { addClientContact, updateClientContact } from "../actions/contacts.actions";
import type { ClientContact } from "@/lib/schema/clients/contacts";

interface ContactEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  contact?: ClientContact | null;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { id: "lpr", title: "👑 ЛПР (лицо, принимающее решения)" },
  { id: "accountant", title: "🧮 Бухгалтер" },
  { id: "buyer", title: "🛒 Закупщик" },
  { id: "other", title: "👤 Другое" },
];

export const ContactEditDialog = memo(function ContactEditDialog({
  isOpen,
  onClose,
  clientId,
  contact,
  onSuccess,
}: ContactEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!contact;

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    role: "other" as "other" | "lpr" | "accountant" | "buyer",
    phone: "",
    email: "",
    telegram: "",
    notes: "",
    isPrimary: false,
  });

  // Заполняем форму при редактировании
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        position: contact.position || "",
        role: (["other", "lpr", "accountant", "buyer"].includes(contact.role as string)
          ? contact.role as "other" | "lpr" | "accountant" | "buyer"
          : "other"),
        phone: contact.phone || "",
        email: contact.email || "",
        telegram: contact.telegram || "",
        notes: contact.notes || "",
        isPrimary: contact.isPrimary || false,
      });
    } else {
      setFormData({
        name: "",
        position: "",
        role: "other",
        phone: "",
        email: "",
        telegram: "",
        notes: "",
        isPrimary: false,
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast("Введите имя контакта", "error");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (isEditing && contact) {
        result = await updateClientContact(contact.id, formData);
      } else {
        result = await addClientContact({
          clientId,
          ...formData,
        });
      }

      if (result.success) {
        toast(
          isEditing ? "Контакт обновлён" : "Контакт добавлен",
          "success"
        );
        playSound("notification_success");
        onSuccess();
      } else {
        toast(result.error || "Ошибка", "error");
        playSound("notification_error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title={isEditing ? "Редактировать контакт" : "Добавить контакт"} description={isEditing ? "Измените данные контактного лица" : "Заполните информацию о контактном лице"} className="max-w-lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-3">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            ФИО <span className="text-rose-500">*</span>
          </label>
          <Input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Иванов Иван Иванович"
            className="h-12 rounded-xl"
            required
          />
        </div>

        {/* Role & Position */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Роль
            </label>
            <Select value={formData.role} onChange={(val) => setFormData(prev => ({ ...prev, role: val as typeof formData.role }))}
              options={ROLE_OPTIONS}
              triggerClassName="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              Должность
            </label>
            <Input type="text" value={formData.position} onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Генеральный директор"
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              Телефон
            </label>
            <Input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+7 (999) 123-45-67"
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              Email
            </label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@company.ru"
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Telegram */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1">
            <Send className="w-3.5 h-3.5" />
            Telegram
          </label>
          <Input type="text" value={formData.telegram} onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
            placeholder="@username"
            className="h-12 rounded-xl"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Заметки
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Дополнительная информация о контакте..."
            rows={3}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-sm focus:border-primary focus:bg-white transition-all outline-none resize-none"
          />
        </div>

        {/* Is Primary */}
        <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={formData.isPrimary}
            onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-bold text-slate-900">Основной контакт</p>
            <p className="text-xs text-slate-500">Будет отображаться первым в списке</p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-11 rounded-xl text-sm font-bold">
            Отмена
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl text-sm font-bold">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Сохранить" : "Добавить"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
});

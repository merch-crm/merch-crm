import React from "react";
import { User, Phone, Mail, MapPin, Building2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";

export interface ClientForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  acquisitionSource: string;
  managerId: string;
  clientType: "b2c" | "b2b";
  city?: string | null;
  address?: string | null;
  comments?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  socialLink?: string | null;
}

interface ClientFormFieldsProps {
  form: ClientForm;
  managers: { id: string; name: string }[];
  acquisitionSources: { id: string; title: string }[];
  onFieldChange: (name: string, value: string) => void;
  onManagerChange: (val: string) => void;
  onSourceChange: (val: string) => void;
}

export function ClientFormFields({
  form,
  managers,
  acquisitionSources,
  onFieldChange,
  onManagerChange,
  onSourceChange
}: ClientFormFieldsProps) {
  return (
    <div className="space-y-3">
      {/* Организация для B2B */}
      <AnimatePresence mode="wait">
        {form.clientType === "b2b" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pb-3">
              <label className="text-sm font-bold text-slate-700 ml-1">
                <Building2 className="w-3.5 h-3.5 inline mr-1" />
                Название организации <span className="text-rose-500">*</span>
              </label>
              <Input type="text" name="company" value={form.company} onChange={(e) => onFieldChange("company", e.target.value)}
                required={form.clientType === "b2b"}
                placeholder="ООО «Компания»"
                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ФИО */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            <User className="w-3.5 h-3.5 inline mr-1" />
            {form.clientType === "b2b" ? "Фамилия контактного лица" : "Фамилия"}
            <span className="text-rose-500">*</span>
          </label>
          <Input type="text" name="lastName" value={form.lastName || ""} onChange={(e) => onFieldChange("lastName", e.target.value)}
            required
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            <User className="w-3.5 h-3.5 inline mr-1" />
            {form.clientType === "b2b" ? "Имя контактного лица" : "Имя"}
            <span className="text-rose-500">*</span>
          </label>
          <Input type="text" name="firstName" value={form.firstName || ""} onChange={(e) => onFieldChange("firstName", e.target.value)}
            required
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
          />
        </div>
      </div>

      {/* Компания для B2C */}
      <AnimatePresence mode="wait">
        {form.clientType === "b2c" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  <Building2 className="w-3.5 h-3.5 inline mr-1" /> Компания
                </label>
                <Input type="text" name="company" value={form.company || ""} onChange={(e) => onFieldChange("company", e.target.value)}
                  placeholder="Необязательно"
                  className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Контакты: Телефон, Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            <Phone className="w-3.5 h-3.5 inline mr-1" /> Телефон <span className="text-rose-500">*</span>
          </label>
          <Input type="text" name="phone" value={form.phone || ""} onChange={(e) => onFieldChange("phone", e.target.value)}
            required
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
          </label>
          <Input type="email" name="email" value={form.email || ""} onChange={(e) => onFieldChange("email", e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
          />
        </div>
      </div>

      {/* Источник и Менеджер */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Источник привлечения
          </label>
          <Select name="acquisitionSource" value={form.acquisitionSource} onChange={onSourceChange} options={acquisitionSources} triggerClassName="h-12 bg-slate-50 border-slate-200" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Менеджер
          </label>
          <Select name="managerId" value={form.managerId} onChange={onManagerChange} options={[ { id: "", title: "Не назначен" }, ...managers.map(m => ({ id: m.id, title: m.name }))
            ]}
            triggerClassName="h-12 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {/* Город и Адрес */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            <MapPin className="w-3.5 h-3.5 inline mr-1" /> Город
          </label>
          <Input type="text" name="city" value={form.city || ""} onChange={(e) => onFieldChange("city", e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Адрес
          </label>
          <Input type="text" name="address" value={form.address || ""} onChange={(e) => onFieldChange("address", e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
          />
        </div>
      </div>

      {/* Комментарии */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 ml-1">
          <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Комментарии
        </label>
        <textarea
          name="comments"
          value={form.comments || ""}
          onChange={(e) => onFieldChange("comments", e.target.value)}
          rows={3}
          className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none resize-none"
        />
      </div>
    </div>
  );
}

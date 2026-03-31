"use client";

import { Building2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FormInput } from "@/components/ui/form-input";
import { ClientTypeSwitch } from "../../components/client-type-switch";

import { NewClientFormData } from "../new-client.types";

interface Step0Props {
    clientType: "b2c" | "b2b";
    setClientType: (type: "b2c" | "b2b") => void;
    formData: NewClientFormData;
    updateFormData: (updates: Partial<NewClientFormData>) => void;
}

export function Step0BasicInfo({ clientType, setClientType, formData, updateFormData }: Step0Props) {
    return (
        <div className="max-w-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClientTypeSwitch
                value={clientType}
                onChange={setClientType}
            />
            <div className="border-t border-slate-100 pt-3" />
            <AnimatePresence mode="wait">
                {clientType === "b2b" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <FormInput
                            label="Название организации"
                            required
                            type="text"
                            value={formData.company}
                            onChange={(e) => updateFormData({ company: e.target.value })}
                            placeholder="ООО «Компания»"
                            icon={<Building2 className="w-4 h-4" />}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                    label={clientType === "b2b" ? "Фамилия контактного лица" : "Фамилия"}
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData({ lastName: e.target.value })}
                />
                <FormInput
                    label={clientType === "b2b" ? "Имя контактного лица" : "Имя"}
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData({ firstName: e.target.value })}
                />
            </div>
            <AnimatePresence mode="wait">
                {clientType === "b2c" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormInput
                                label="Отчество"
                                type="text"
                                value={formData.patronymic}
                                onChange={(e) => updateFormData({ patronymic: e.target.value })}
                            />
                            <FormInput
                                label="Компания"
                                type="text"
                                value={formData.company}
                                onChange={(e) => updateFormData({ company: e.target.value })}
                                placeholder="Необязательно"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

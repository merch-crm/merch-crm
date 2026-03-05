"use client";

import { FormInput } from "@/components/ui/form-input";

import { NewClientFormData } from "../new-client.types";

interface Step1Props {
    formData: NewClientFormData;
    updateFormData: (updates: Partial<NewClientFormData>) => void;
}

export function Step1Contacts({ formData, updateFormData }: Step1Props) {
    return (
        <div className="max-w-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                    label="Телефон"
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => updateFormData({ phone: e.target.value })}
                />
                <FormInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormInput
                    label="Telegram"
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => updateFormData({ telegram: e.target.value })}
                    placeholder="@username"
                />
                <FormInput
                    label="Instagram"
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => updateFormData({ instagram: e.target.value })}
                />
                <FormInput
                    label="Соцсеть"
                    type="text"
                    value={formData.socialLink}
                    onChange={(e) => updateFormData({ socialLink: e.target.value })}
                    placeholder="vk.com/..."
                />
            </div>
        </div>
    );
}

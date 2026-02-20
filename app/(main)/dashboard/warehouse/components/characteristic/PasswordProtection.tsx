"use client";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";

interface PasswordProtectionProps {
    password: string;
    setPassword: (password: string) => void;
}

export function PasswordProtection({ password, setPassword }: PasswordProtectionProps) {
    return (
        <div className="px-1 pb-4">
            <div className="bg-rose-50 p-4 rounded-[var(--radius-inner)] border border-rose-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-rose-600">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-bold ">Системная защита</span>
                </div>
                <p className="text-xs font-bold text-rose-500/80 leading-relaxed">
                    Это системный раздел. Для подтверждения удаления введите пароль от своей учетной записи.
                </p>
                <Input
                    type="password"
                    id="delete-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль от своей учетной записи"
                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-rose-200"
                    autoFocus
                />
            </div>
        </div>
    );
}

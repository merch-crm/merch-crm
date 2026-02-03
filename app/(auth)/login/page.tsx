"use client";

import { useState, useEffect } from "react";
import { Loader2, User, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";

type BrandingSettings = Awaited<ReturnType<typeof getBrandingSettings>>;

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [branding, setBranding] = useState<BrandingSettings | null>(null);

    useEffect(() => {
        getBrandingSettings().then(setBranding);
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Произошла ошибка при входе");
                setIsLoading(false);
                return;
            }

            if (data.success) {
                window.location.href = "/dashboard";
            } else {
                setError(data.error || "Неизвестная ошибка");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Ошибка сети. Попробуйте позже.");
            setIsLoading(false);
        }
    }

    const primaryColor = branding?.primaryColor || "#5d00ff";
    const logoUrl = branding?.logoUrl || ((branding as Record<string, unknown> | null)?.['logo_url'] as string);
    const bgUrl = branding?.loginBackgroundUrl;
    const slogan = branding?.loginSlogan || "Система управления производством";
    const companyName = branding?.companyName || "MerchCRM";

    return (
        <div
            className="min-h-screen bg-background flex items-center justify-center p-4 font-sans antialiased relative overflow-hidden transition-colors duration-500"
            style={{
                '--primary': primaryColor,
            } as React.CSSProperties & { [key: string]: string | undefined }}
        >
            {/* Background Image or Gradient */}
            {bgUrl ? (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                    style={{ backgroundImage: `url(${bgUrl})` }}
                >
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
                </div>
            ) : (
                <>
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none opacity-50" style={{ backgroundColor: primaryColor }} />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none opacity-30" style={{ backgroundColor: primaryColor }} />
                </>
            )}

            <Card className="w-full max-w-md p-8 shadow-2xl bg-white/80 backdrop-blur-xl border-white/20 relative overflow-hidden group hover:shadow-primary/10 transition-all duration-500 rounded-[32px]">
                <div className="flex flex-col items-center mb-10 space-y-5">
                    <div
                        className="p-4 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 duration-300 w-20 h-20 flex items-center justify-center overflow-hidden relative"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {logoUrl ? (
                            <Image src={logoUrl} alt="Logo" fill className="object-contain" priority />
                        ) : (
                            <Building2 className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            {companyName}
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">
                            {slogan}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 pl-1" htmlFor="email">
                                Email
                            </label>
                            <div className="relative group/input">
                                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Введите логин"
                                    defaultValue="admin@crm.local"
                                    className="pl-11 h-12 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/10 transition-all rounded-2xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 pl-1" htmlFor="password">
                                Пароль
                            </label>
                            <div className="relative group/input">
                                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Введите пароль"
                                    className="pl-11 pr-11 h-12 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/10 transition-all rounded-2xl"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-600 text-sm font-medium text-center">
                                {error}
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 text-lg font-bold transition-all active:scale-[0.98] rounded-2xl shadow-lg border-none hover:opacity-90"
                        style={{ backgroundColor: primaryColor, color: 'white' }}
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Войти в систему"}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        © 2026 {companyName}. CRM System
                    </p>
                </div>
            </Card>
        </div>
    );
}

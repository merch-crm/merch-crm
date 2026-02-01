"use client";

import { useEffect, useState } from "react";
import { Loader2, Printer, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                // Force a hard navigation to update cookies middleware state
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

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans antialiased relative overflow-hidden">
            {/* Background Aesthetic Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

            <Card className="w-full max-w-md p-8 shadow-2xl bg-card/50 backdrop-blur-xl border-border/50 relative overflow-hidden group hover:shadow-primary/10 transition-all duration-500">
                {/* Decorative top gradient */}
                {/* Decorative top gradient removed based on request */}

                <div className="flex flex-col items-center mb-10 space-y-4">
                    <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg shadow-primary/25 transform transition-transform group-hover:scale-110 duration-300">
                        <Printer className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                            MerchCRM
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                            Система управления производством
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 pl-1" htmlFor="email">
                                Email
                            </label>
                            <div className="relative group/input">
                                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Введите логин"
                                    defaultValue="admin@crm.local"
                                    className="pl-10 h-11 bg-background/50 border-input/50 focus:border-primary focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/80 pl-1" htmlFor="password">
                                Пароль
                            </label>
                            <div className="relative group/input">
                                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Введите пароль"
                                    className="pl-10 pr-10 h-11 bg-background/50 border-input/50 focus:border-primary focus:ring-primary/20 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors outline-none focus:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pl-1">
                        <input
                            type="checkbox"
                            id="remember"
                            className="rounded border-input text-primary focus:ring-primary"
                        />
                        <label htmlFor="remember" className="text-sm text-muted-foreground font-medium cursor-pointer select-none">
                            Запомнить меня
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-destructive text-sm font-medium text-center">
                                {error}
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 text-lg font-bold transition-all active:scale-[0.98]"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                        {isLoading ? "Загрузка..." : "Войти в систему"}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/60">
                        © 2026 MerchCRM. Все права защищены.
                    </p>
                </div>
            </Card>
        </div>
    );
}

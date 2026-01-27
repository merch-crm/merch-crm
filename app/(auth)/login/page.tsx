"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Loader2, Printer, User, Lock, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-14 text-lg font-bold transition-all active:scale-[0.98]"
        >
            {pending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            {pending ? "Загрузка..." : "Войти в систему"}
        </Button>
    );
}

export default function LoginPage() {
    const [state, action] = useActionState(loginAction, null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans antialiased relative overflow-hidden">
            {/* Background Aesthetic Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

            <Card className="max-w-[420px] w-full p-8 md:p-10 flex flex-col items-center border-none shadow-2xl relative z-10 bg-white/80 backdrop-blur-xl">
                {/* Logo Section */}
                <div className="w-16 h-16 bg-primary rounded-[18px] flex items-center justify-center mb-8 shadow-lg shadow-primary/30 transform hover:scale-105 transition-transform">
                    <Printer className="h-8 w-8 text-primary-foreground" strokeWidth={2} />
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground leading-tight mb-2">
                        MerchCRM
                    </h2>
                    <p className="text-muted-foreground font-medium">
                        Система управления производством
                    </p>
                </div>

                <form action={action} className="w-full space-y-6">
                    <div className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" strokeWidth={2} />
                                </div>
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    className="h-12 pl-12 bg-secondary/50 border-none focus:bg-white"
                                    placeholder="Введите логин"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground ml-1">Пароль</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" strokeWidth={2} />
                                </div>
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="h-12 pl-12 pr-12 bg-secondary/50 border-none focus:bg-white"
                                    placeholder="Введите пароль"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground/50 hover:text-primary transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2} /> : <Eye className="h-5 w-5" strokeWidth={2} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center space-x-2">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer transition-all"
                            />
                            <label htmlFor="remember-me" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                                Запомнить меня
                            </label>
                        </div>
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-xs font-bold text-center rounded-[18px] border border-destructive/20 animate-in fade-in zoom-in-95">
                            {state.error}
                        </div>
                    )}

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
                </form>

                <div className="mt-8 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} MerchCRM. Все права защищены.
                </div>
            </Card>
        </div>
    );
}


"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");
    const urlError = searchParams.get("error");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (urlError === "INVALID_TOKEN") {
            toast.error("Ссылка устарела или уже была использована.");
        }
    }, [urlError]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!token) {
            toast.error("Токен отсутствует. Перейдите по ссылке из письма.");
            return;
        }

        if (password !== confirm) {
            toast.error("Пароли не совпадают");
            return;
        }

        if (password.length < 8) {
            toast.error("Минимум 8 символов");
            return;
        }

        setLoading(true);

        const { error } = await authClient.resetPassword({
            newPassword: password,
            token,
        });

        setLoading(false);

        if (error) {
            toast.error(error.message ?? "Не удалось сбросить пароль. Попробуйте запросить ссылку заново.");
            return;
        }

        toast.success("Пароль успешно изменён! Теперь вы можете войти с новым паролем.");
        router.push("/login");
    }

    // Невалидный токен — отдельный экран
    if (urlError === "INVALID_TOKEN") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/40">
                <div className="flex flex-col items-center gap-3 rounded-2xl border bg-background p-10 text-center shadow-sm max-w-sm w-full mx-4">
                    <div className="text-5xl">⛔</div>
                    <h2 className="text-xl font-semibold">Ссылка недействительна</h2>
                    <p className="text-sm text-muted-foreground">
                        Эта ссылка устарела или уже была использована.
                    </p>
                    <a
                        href="/forgot-password"
                        className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Запросить новую ссылку &rarr;
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <div className="w-full max-w-sm mx-4">
                <div className="rounded-2xl border bg-background p-8 shadow-sm flex flex-col gap-3">
                    <div className="text-center flex flex-col gap-1">
                        <h1 className="text-2xl font-bold">Новый пароль</h1>
                        <p className="text-sm text-muted-foreground">
                            Введите новый пароль для вашего аккаунта
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Новый пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Минимум 8 символов"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirm">Подтвердите пароль</Label>
                            <Input
                                id="confirm"
                                type="password"
                                placeholder="Повторите пароль"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !token}
                        >
                            {loading ? "Сохранение..." : "Сохранить новый пароль"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        <a href="/login" className="text-primary underline-offset-4 hover:underline">
                            &larr; Вернуться к входу
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-muted/40">
                <div className="text-muted-foreground">Загрузка...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

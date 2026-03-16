"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export default function TwoFactorPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const code = formData.get("code") as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (authClient as any).twoFactor.verifyTotp({
            code,
        });

        if (error) {
            setError("Неверный код. Попробуйте еще раз.");
        } else {
            router.push("/dashboard");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 shadow-xl bg-white rounded-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">Двухфакторная аутентификация</h1>
                    <p className="text-slate-500 mt-2">Введите код из приложения-аутентификатора</p>
                </div>
                
                <form onSubmit={handleVerify} className="flex flex-col gap-3">
                    <Input
                        name="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000 000"
                        className="text-center text-2xl tracking-wider h-14"
                        autoFocus
                        required
                    />
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <SubmitButton className="w-full">Подтвердить</SubmitButton>
                </form>
            </Card>
        </div>
    );
}

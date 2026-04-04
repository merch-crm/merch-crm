"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function TwoFactorSetup() {
    const [step, setStep] = useState<"idle" | "setup">("idle");
    const [totpUri, setTotpUri] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [password, setPassword] = useState("");
    const [uiState, setUiState] = useState<{ isLoading: boolean; errorMsg: string | null; successMsg: string | null }>({
        isLoading: false,
        errorMsg: null,
        successMsg: null,
    });

    async function enableTwoFactor() {
        if (!password) {
            setUiState((prev) => ({ ...prev, errorMsg: "Введите текущий пароль" }));
            return;
        }
        setUiState({ isLoading: true, errorMsg: null, successMsg: null });
        
        const { data, error } = await authClient.twoFactor.enable({
            password,
        });
        
        setUiState((prev) => ({ ...prev, isLoading: false }));

        if (error) {
            setUiState((prev) => ({ ...prev, errorMsg: error.message || "Ошибка включения 2FA (возможно неверный пароль)" }));
            return;
        }

        if (data) {
            setTotpUri(data.totpURI);
            setBackupCodes(data.backupCodes);
            setStep("setup");
        }
    }

    async function confirmSetup(code: string) {
        setUiState((prev) => ({ ...prev, isLoading: true, errorMsg: null }));
        const { error } = await authClient.twoFactor.verifyTotp({ code });

        if (error) {
            setUiState({ isLoading: false, errorMsg: "Неверный код", successMsg: null });
        } else {
            setUiState({ isLoading: false, errorMsg: null, successMsg: "2FA успешно включена!" });
            setStep("idle");
        }
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Двухфакторная аутентификация (2FA)</CardTitle>
                <CardDescription>Защитите свой аккаунт с помощью дополнительного уровня безопасности</CardDescription>
            </CardHeader>
            <CardContent>
                {step === "idle" && (
                    <div className="flex flex-col gap-3 max-w-sm">
                        {uiState.successMsg && <p className="text-sm font-medium text-green-600 mb-2">{uiState.successMsg}</p>}
                        <Input
                            type="password"
                            placeholder="Введите ваш пароль для подтверждения"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {uiState.errorMsg && <p className="text-sm text-red-500">{uiState.errorMsg}</p>}
                        <Button disabled={uiState.isLoading} onClick={enableTwoFactor}>
                            Включить 2FA
                        </Button>
                    </div>
                )}

                {step === "setup" && totpUri && (
                    <div className="flex flex-col gap-3">
                        <div className="bg-slate-50 p-6 rounded-lg inline-block border">
                            <QRCodeSVG value={totpUri} size={200} />
                        </div>

                        <div>
                            <p className="font-semibold text-slate-700 mb-2">Или введите ключ вручную:</p>
                            <code className="bg-slate-100 px-3 py-1 rounded text-sm break-all">
                                {new URL(totpUri).searchParams.get("secret")}
                            </code>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-700 mt-4 mb-2">Резервные коды:</p>
                            <p className="text-sm text-slate-500 mb-2">Сохраните эти коды в надежном месте. Они понадобятся, если вы потеряете доступ к телефону.</p>
                            <div className="grid grid-cols-2 gap-2 max-w-sm">
                                {backupCodes.map((code) => (
                                    <div key={code} className="bg-slate-100 p-2 text-center rounded text-sm font-mono ">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="max-w-xs pt-4 border-t">
                            <p className="text-sm font-medium mb-3">Подтверждение настройки</p>
                            <Input
                                type="text"
                                placeholder="Введите 6-значный код"
                                className="text-center  text-lg h-12"
                                maxLength={6}
                                onChange={(e) => {
                                    if (e.target.value.length === 6) {
                                        confirmSetup(e.target.value);
                                    }
                                }}
                            />
                            {uiState.errorMsg && <p className="text-sm text-red-500 mt-2">{uiState.errorMsg}</p>}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

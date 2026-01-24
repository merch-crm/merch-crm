"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { X, Camera, RefreshCw, Zap, ZapOff } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onResult: (result: string) => void;
}

export function QRScanner({ isOpen, onClose, onResult }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [torchOn, setTorchOn] = useState(false);
    const scannerId = "qr-reader";

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            if (scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
                try {
                    await scannerRef.current.stop();
                } catch (e) {
                    console.warn("Failed to stop scanner", e);
                }
            }
            scannerRef.current = null;
        }
    }, []);

    const startScanner = useCallback(async () => {
        setIsStarting(true);
        setError(null);

        try {
            const scanner = new Html5Qrcode(scannerId);
            scannerRef.current = scanner;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await scanner.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    onResult(decodedText);
                    stopScanner();
                    onClose();
                },
                () => {
                    // Ignore errors during scanning
                }
            );
            setIsStarting(false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);

            if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission denied")) {
                setError("Доступ к камере отклонен. Пожалуйста, разрешите использование камеры в настройках браузера и обновите страницу.");
            } else {
                setError("Не удалось запустить камеру. Проверьте, что она не используется другим приложением.");
            }
            setIsStarting(false);
        }
    }, [scannerId, onResult, onClose, stopScanner]);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Scanner lifecycle management
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen, startScanner, stopScanner]);

    const toggleTorch = async () => {
        if (scannerRef.current) {
            try {
                const newState = !torchOn;
                await scannerRef.current.applyVideoConstraints({
                    // @ts-expect-error - torch is a valid constraint but not in standard types
                    advanced: [{ torch: newState }]
                });
                setTorchOn(newState);
            } catch (e) {
                console.warn("Torch error", e);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden border border-white/10">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Сканер SKU</h3>
                        <p className="text-xs font-medium text-slate-500">Наведите камеру на QR-код товара</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-slate-50"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </Button>
                </div>

                <div className="relative aspect-square bg-slate-900">
                    <div id={scannerId} className="w-full h-full" />

                    {isStarting && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/60 transition-all">
                            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Запуск камеры...</span>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white bg-rose-500/90">
                            <Camera className="w-12 h-12 mb-4 opacity-50" />
                            <h4 className="font-bold mb-2">Ошибка доступа</h4>
                            <p className="text-xs opacity-80 leading-relaxed mb-6">{error}</p>
                            <Button variant="outline" onClick={startScanner} className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                                Попробовать снова
                            </Button>
                        </div>
                    )}

                    {/* Overlay Frame */}
                    {!isStarting && !error && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[250px] h-[250px] border-2 border-primary rounded-2xl shadow-[0_0_0_1000px_rgba(15,23,42,0.6)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent h-1/2 animate-scan-line" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 flex items-center justify-center gap-4 bg-slate-50/50">
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={toggleTorch}
                        className={cn(
                            "rounded-full w-12 h-12 p-0 flex items-center justify-center transition-all",
                            torchOn ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-white text-slate-400 border-slate-200"
                        )}
                    >
                        {torchOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
                    </Button>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Центрируйте код в рамке
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan-line {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(200%); }
                }
                .animate-scan-line {
                    animation: scan-line 2s ease-in-out infinite;
                }
                #qr-reader__scan_region video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #qr-reader {
                    border: none !important;
                }
            `}</style>
        </div>
    );
}

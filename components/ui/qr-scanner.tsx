"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { X, Camera, RefreshCw, Zap, ZapOff, QrCode } from "lucide-react";
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500" role="dialog" aria-modal="true" data-dialog-open="true">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-none">
                <div className="p-5 flex items-center justify-between border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <QrCode className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Сканер SKU</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Наведите на QR-код</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-lg bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative aspect-square bg-black group">
                    <div id={scannerId} className="w-full h-full" />

                    {isStarting && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 backdrop-blur-sm transition-all z-10">
                            <div className="relative">
                                <RefreshCw className="w-10 h-10 animate-spin text-primary" />
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mt-6">Инициализация...</span>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white bg-rose-500/95 backdrop-blur-md z-20">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="font-black text-sm uppercase tracking-wider mb-2">Ошибка доступа</h4>
                            <p className="text-[11px] font-bold text-white/70 leading-relaxed mb-8 px-4">{error}</p>
                            <Button
                                variant="outline"
                                onClick={startScanner}
                                className="h-10 px-6 bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                            >
                                Попробовать снова
                            </Button>
                        </div>
                    )}

                    {/* Overlay Frame */}
                    {!isStarting && !error && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                            <div className="w-[220px] h-[220px] border-2 border-primary/50 rounded-2xl shadow-[0_0_0_1000px_rgba(15,23,42,0.4)] relative overflow-hidden backdrop-contrast-[1.1]">
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary rounded-br-lg" />

                                <div className="absolute inset-x-0 top-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(37,99,235,0.8)] animate-scan-line" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 flex items-center justify-between bg-slate-50/50">
                    <button
                        onClick={toggleTorch}
                        className={cn(
                            "w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-90 border shadow-sm",
                            torchOn
                                ? "bg-amber-100 text-amber-600 border-amber-200 shadow-amber-200/20"
                                : "bg-white text-slate-400 border-slate-200"
                        )}
                    >
                        {torchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
                    </button>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Система готова</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ожидание кода...</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan-line {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(220px); opacity: 0; }
                }
                .animate-scan-line {
                    animation: scan-line 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                #qr-reader__scan_region video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 0 !important;
                }
                #qr-reader {
                    border: none !important;
                }
                #qr-reader img {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}

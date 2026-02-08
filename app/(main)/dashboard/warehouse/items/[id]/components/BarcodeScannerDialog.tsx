"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface BarcodeScannerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

export function BarcodeScannerDialog({
    isOpen,
    onClose,
    onScan
}: BarcodeScannerDialogProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopScanner = React.useCallback(() => {
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
            }).catch(err => {
                console.error("Failed to stop scanner", err);
            });
            scannerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        // Small delay to ensure modal is rendered
        const timer = setTimeout(() => {
            const scanner = new Html5Qrcode("reader");
            scannerRef.current = scanner;

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            scanner.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    // Success callback
                    if (navigator.vibrate) navigator.vibrate(50);
                    onScan(decodedText);
                    stopScanner();
                },
                () => {
                    // console.log(errorMessage); // Ignore scan errors
                }
            ).catch(err => {
                console.error("Error starting scanner", err);
                setError("Не удалось запустить камеру. Проверьте разрешения.");
            });
        }, 300);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [isOpen, onScan, stopScanner]);

    const handleClose = () => {
        stopScanner();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md bg-white border-none text-slate-900 p-0 overflow-hidden rounded-3xl shadow-2xl [&>button]:hidden">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center shadow-sm">
                            <Camera className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">Штрихкод</DialogTitle>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">Наведите на код товара</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="relative bg-black rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-2xl ring-1 ring-white/5">
                        <div id="reader" className="w-full h-full" />
                        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                            <div className="w-full h-full border-2 border-primary/50 relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-sm" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-sm" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-sm" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-sm" />
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/30 animate-pulse shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                            </div>
                        </div>
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                                <p className="text-rose-400 text-[11px] font-bold leading-relaxed">{error}</p>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleClose}
                        variant="ghost"
                        className="w-full h-12 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-all"
                    >
                        Завершить сканирование
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

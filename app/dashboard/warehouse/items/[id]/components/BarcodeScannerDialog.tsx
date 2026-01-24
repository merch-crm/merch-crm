"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

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
                (errorMessage) => {
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
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-3 text-white">
                        <Camera className="w-5 h-5 text-primary" />
                        <span className="font-black uppercase tracking-widest text-sm">Сканирование штрихкода</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 pt-0 space-y-4">
                    <div className="relative bg-black rounded-2xl overflow-hidden aspect-square border border-slate-700 shadow-inner">
                        <div id="reader" className="w-full h-full" />
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                <p className="text-rose-400 text-sm font-bold">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            onClick={handleClose}
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-white/10"
                        >
                            Закрыть
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

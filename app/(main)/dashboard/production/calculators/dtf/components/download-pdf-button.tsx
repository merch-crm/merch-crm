"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import {
    FileDown,
    FileText,
    Image as ImageIcon,
    ChevronDown,
    Settings2,
} from "lucide-react";
import {
    generatePdfReport,
    generatePdfFileName,
} from "../../lib/pdf-generator";
import {
    type CalculationResult,
    type CalculatorParams,
    type ApplicationType,
} from "../../types";

interface DownloadPdfButtonProps {
    result: CalculationResult;
    params: CalculatorParams;
    applicationType: ApplicationType;
    calculationNumber?: string;
    canvasRef?: React.RefObject<HTMLCanvasElement | null>;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

type ExportMode = "full" | "simple" | "withCanvas";

export const DownloadPdfButton = memo(function DownloadPdfButton({
    result,
    params,
    applicationType,
    calculationNumber,
    canvasRef,
    variant = "outline",
    size = "default",
    className,
}: DownloadPdfButtonProps) {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingMode, setGeneratingMode] = useState<ExportMode | null>(null);

    const getCanvasDataUrl = useCallback((): string | undefined => {
        if (!canvasRef?.current) return undefined;

        try {
            return canvasRef.current.toDataURL("image/png");
        } catch (error) {
            console.error("Failed to get canvas data URL:", error);
            return undefined;
        }
    }, [canvasRef]);

    const handleDownload = useCallback(
        async (mode: ExportMode) => {
            setIsGenerating(true);
            setGeneratingMode(mode);

            try {
                const canvasDataUrl = mode === "withCanvas" ? getCanvasDataUrl() : undefined;

                const blob = await generatePdfReport({
                    calculationNumber,
                    createdAt: new Date(), // suppressHydrationWarning
                    applicationType,
                    params,
                    result,
                    options: {
                        includeCanvas: mode === "withCanvas",
                        canvasDataUrl,
                        includeConsumption: mode !== "simple",
                        includeCostBreakdown: mode !== "simple",
                        companyName: "MerchCRM",
                    },
                });

                // Создаём ссылку для скачивания
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = generatePdfFileName(applicationType, calculationNumber);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast("PDF сформирован: Файл скачан на ваше устройство", "success");
            } catch (error) {
                console.error("PDF generation error:", error);
                toast("Ошибка генерации: Не удалось сформировать PDF-отчёт", "error");
            } finally {
                setIsGenerating(false);
                setGeneratingMode(null);
            }
        },
        [result, params, applicationType, calculationNumber, getCanvasDataUrl, toast]
    );

    const handleQuickDownload = useCallback(() => {
        handleDownload("full");
    }, [handleDownload]);

    // Если нет выбора (нет рефа на канвас) — простая кнопка
    if (!canvasRef) {
        return (
            <Button
                variant={variant}
                size={size}
                onClick={handleQuickDownload}
                disabled={isGenerating}
                className={className}
            >
                {isGenerating ? (
                    <Spinner size="sm" className="mr-2" />
                ) : (
                    <FileDown className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">Скачать PDF</span>
            </Button>
        );
    }

    // С выбором режима
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    disabled={isGenerating}
                    className={className}
                >
                    {isGenerating ? (
                        <Spinner size="sm" className="mr-2" />
                    ) : (
                        <FileDown className="w-4 h-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">Скачать PDF</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                    onClick={() => handleDownload("full")}
                    disabled={isGenerating}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                        <span>Полный отчёт</span>
                        <span className="text-xs text-slate-500">Все данные и расходники</span>
                    </div>
                    {generatingMode === "full" && <Spinner size="sm" className="ml-auto" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleDownload("withCanvas")}
                    disabled={isGenerating}
                >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                        <span>С визуализацией</span>
                        <span className="text-xs text-slate-500">Включая схему раскладки</span>
                    </div>
                    {generatingMode === "withCanvas" && <Spinner size="sm" className="ml-auto" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => handleDownload("simple")}
                    disabled={isGenerating}
                >
                    <Settings2 className="w-4 h-4 mr-2" />
                    <div className="flex flex-col">
                        <span>Краткий отчёт</span>
                        <span className="text-xs text-slate-500">Только итоги и секции</span>
                    </div>
                    {generatingMode === "simple" && <Spinner size="sm" className="ml-auto" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

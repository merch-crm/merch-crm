"use client";

import { useEditor } from "./EditorProvider";
import { cn } from "@/lib/utils";

interface EditorCanvasProps {
    className?: string;
}

export function EditorCanvas({ className }: EditorCanvasProps) {
    const { canvasContainerRef, isReady } = useEditor();

    return (
        <div className={cn("relative flex-1 overflow-hidden", className)}>
            {/* Canvas Container */}
            <div
                className="absolute inset-0 flex items-center justify-center bg-[#f0f0f0]"
                style={{
                    backgroundImage: `
                        linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                        linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                        linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
                    `,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
            >
                <div
                    ref={canvasContainerRef}
                    className="shadow-2xl rounded-lg overflow-hidden"
                    style={{
                        // Canvas будет добавлен сюда
                    }}
                />
            </div>

            {/* Loading Overlay */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground">
                            Загрузка редактора...
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

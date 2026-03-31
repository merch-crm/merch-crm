"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorProvider } from "./components/EditorProvider";
import { EditorCanvas } from "./components/EditorCanvas";
import { EditorToolbar } from "./components/EditorToolbar";
import { EditorSidebar } from "./components/EditorSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function EditorPageClient() {
    const router = useRouter();

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <EditorProvider
            config={{
                width: 800,
                height: 600,
                maxLayers: 10,
                maxHistory: 50,
            }}
        >
            <div className="h-screen flex flex-col bg-background">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-2 border-b">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">Редактор макетов</h1>
                </div>

                {/* Toolbar */}
                <EditorToolbar />

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Canvas */}
                    <EditorCanvas />

                    {/* Sidebar */}
                    <EditorSidebar />
                </div>
            </div>
        </EditorProvider>
    );
}

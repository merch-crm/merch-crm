"use client";

import { useEditor, PanelType } from "./EditorProvider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Layers,
    Settings2,
    Type,
    Sliders,

} from "lucide-react";
import { LayersPanel } from "./panels/LayersPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { TextPanel } from "./panels/TextPanel";
import { FiltersPanel } from "./panels/FiltersPanel";

const PANELS: { id: PanelType; label: string; icon: React.ReactNode }[] = [
    { id: "layers", label: "Слои", icon: <Layers className="h-4 w-4" /> },
    { id: "properties", label: "Свойства", icon: <Settings2 className="h-4 w-4" /> },
    { id: "text", label: "Текст", icon: <Type className="h-4 w-4" /> },
    { id: "filters", label: "Фильтры", icon: <Sliders className="h-4 w-4" /> },
];

export function EditorSidebar() {
    const { activePanel, setActivePanel, selectedObjects } = useEditor();

    const selectedType = selectedObjects[0]?.type;

    // Фильтруем панели в зависимости от выделения
    const availablePanels = PANELS.filter((panel) => {
        if (panel.id === "text") {
            return selectedType === "text";
        }
        if (panel.id === "filters") {
            return selectedType === "image";
        }
        return true;
    });

    const renderPanel = () => {
        switch (activePanel) {
            case "layers":
                return <LayersPanel />;
            case "properties":
                return <PropertiesPanel />;
            case "text":
                return <TextPanel />;
            case "filters":
                return <FiltersPanel />;
            default:
                return <LayersPanel />;
        }
    };

    return (
        <div className="w-72 border-l bg-background flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b p-1 gap-1">
                {availablePanels.map((panel) => (
                    <Button
                        key={panel.id}
                        variant={activePanel === panel.id ? "secondary" : "ghost"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setActivePanel(panel.id)}
                    >
                        {panel.icon}
                        <span className="ml-1.5 text-xs">{panel.label}</span>
                    </Button>
                ))}
            </div>

            {/* Panel Content */}
            <ScrollArea className="flex-1">
                <div className="p-3">
                    {renderPanel()}
                </div>
            </ScrollArea>
        </div>
    );
}

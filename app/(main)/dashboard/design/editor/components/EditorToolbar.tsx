"use client";

import { useRef, useCallback } from "react";
import {
  Undo2,
  Redo2,
  ImagePlus,
  Type,
  Copy,
  Trash2,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
} from "lucide-react";
import { useEditor, useEditorHistory } from "./EditorProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function EditorToolbar() {
  const {
    editor,
    isReady,
    selectedObjects,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    duplicateSelected,
    removeSelected,
  } = useEditor();

  const { undo, redo, canUndo, canRedo } = useEditorHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSelection = selectedObjects.length > 0;
  const selectedType = selectedObjects[0]?.type;

  const handleAddText = useCallback(() => {
    editor?.addText("Новый текст");
  }, [editor]);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && editor) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          editor.addImage(dataUrl);
        };
        reader.readAsDataURL(file);
      }
      // Сбрасываем input
      e.target.value = "";
    },
    [editor]
  );

  const handleDuplicate = useCallback(() => {
    duplicateSelected();
  }, [duplicateSelected]);

  const handleDelete = useCallback(() => {
    removeSelected();
  }, [removeSelected]);

  const handleFlip = useCallback(
    (direction: "horizontal" | "vertical") => {
      if (selectedObjects.length > 0) {
        selectedObjects.forEach(obj => {
          editor?.flipObject(obj.id, direction);
        });
      }
    },
    [editor, selectedObjects]
  );

  const handleExport = useCallback(
    async (format: "png" | "jpeg") => {
      if (!editor) return;
      const result = await editor.exportImage({ format, quality: 1, multiplier: 1, withWatermark: false });
      if (!result || !result.dataUrl) return;
      const link = document.createElement("a");
      link.download = `design-export.${format}`;
      link.href = result.dataUrl;
      link.click();
    },
    [editor]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 p-2 border-b bg-background">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Tooltip content="Отменить (Ctrl+Z)">
            <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo || !isReady}>
              <Undo2 className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Повторить (Ctrl+Y)">
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo || !isReady}>
              <Redo2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Добавление объектов */}
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <Tooltip content="Добавить изображение">
            <Button variant="ghost" size="icon" onClick={handleImageUpload} disabled={!isReady}>
              <ImagePlus className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Добавить текст">
            <Button variant="ghost" size="icon" onClick={handleAddText} disabled={!isReady}>
              <Type className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Действия с выделением */}
        <div className="flex items-center gap-1">
          <Tooltip content="Дублировать (Ctrl+D)">
            <Button variant="ghost" size="icon" onClick={handleDuplicate} disabled={!hasSelection || !isReady}>
              <Copy className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Удалить (Delete)">
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={!hasSelection || !isReady}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>

          {/* Flip (только для изображений) */}
          {selectedType === "image" && (
            <>
              <Tooltip content="Отразить по горизонтали">
                <Button variant="ghost" size="icon" onClick={() => handleFlip("horizontal")}
                  disabled={!isReady}
                >
                  <FlipHorizontal className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content="Отразить по вертикали">
                <Button variant="ghost" size="icon" onClick={() => handleFlip("vertical")}
                  disabled={!isReady}
                >
                  <FlipVertical className="h-4 w-4" />
                </Button>
              </Tooltip>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <Tooltip content="Уменьшить">
            <Button variant="ghost" size="icon" onClick={zoomOut} disabled={!isReady || zoom <= 0.1}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </Tooltip>

          <div className="w-24 flex items-center gap-2">
            <Slider value={[zoom * 100]} min={10} max={300} step={10} onValueChange={([value]) => setZoom(value / 100)}
              disabled={!isReady}
            />
          </div>

          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <Tooltip content="Увеличить">
            <Button variant="ghost" size="icon" onClick={zoomIn} disabled={!isReady || zoom>= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Сбросить масштаб">
            <Button variant="ghost" size="icon" onClick={resetZoom} disabled={!isReady}>
              <Maximize className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Экспорт */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="solid" color="purple" size="sm" disabled={!isReady}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("png")}>
              Сохранить как PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("jpeg")}>
              Сохранить как JPEG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}

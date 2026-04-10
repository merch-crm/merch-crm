"use client";

import { memo, useState } from "react";
import { Save, Download, Copy, Link, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  onSave: () => Promise<void>;
  onDownloadPdf: () => Promise<void>;
  onCopy: () => void;
  onLinkToOrder?: () => void;
  isSaving?: boolean;
  isGeneratingPdf?: boolean;
  className?: string;
}

export const ActionButtons = memo(function ActionButtons({
  onSave,
  onDownloadPdf,
  onCopy,
  onLinkToOrder,
  isSaving = false,
  isGeneratingPdf = false,
  className,
}: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      {/* Save */}
      <Button variant="outline" className="flex-1" onClick={onSave} disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isSaving ? "Сохранение..." : "Сохранить"}
        </span>
      </Button>

      {/* Download PDF */}
      <Button variant="outline" className="flex-1" onClick={onDownloadPdf} disabled={isGeneratingPdf}>
        {isGeneratingPdf ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isGeneratingPdf ? "Генерация..." : "Скачать PDF"}
        </span>
      </Button>

      {/* Copy */}
      <Button variant="outline" className="flex-1" onClick={handleCopy}>
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {copied ? "Скопировано" : "Копировать"}
        </span>
      </Button>

      {/* Link to Order */}
      {onLinkToOrder && (
        <Button variant="outline" className="flex-1" onClick={onLinkToOrder}>
          <Link className="h-4 w-4" />
          <span className="hidden sm:inline">К заказу</span>
        </Button>
      )}
    </div>
  );
});

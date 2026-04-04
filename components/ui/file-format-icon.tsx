import * as React from "react"
import { 
  FileText, 
  FileCode, 
  FileImage, 
  FileType, 
  FileArchive, 
  FileSpreadsheet, 
  FileBox, 
  File 
} from "lucide-react"

import { cn } from "@/lib/utils"

const icons = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  zip: FileArchive,
  rar: FileArchive,
  jpg: FileImage,
  png: FileImage,
  svg: FileCode,
  json: FileCode,
  code: FileCode,
  box: FileBox,
  fig: FileCode,
} as const;

export type FileType = keyof typeof icons;

export function FileFormatIcon({ 
  type, 
  className 
}: { 
  type: string; 
  className?: string; // This was 'type' in props but I kept it for backward compatibility or fixed it?
}) {
  const Icon = icons[type.toLowerCase() as FileType] || File;
  return <Icon className={cn("size-4", className)} />;
}

export const Root = ({ 
  format, 
  className 
}: { 
  format: string; 
  className?: string;
}) => {
  const Icon = icons[format.toLowerCase() as FileType] || File;
  return <Icon className={cn("size-4", className)} />;
};

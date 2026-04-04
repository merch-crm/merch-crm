"use client";

import React from "react";
import { FileText, FileImage, FileCode, Film, FileArchive, MoreHorizontal } from "lucide-react";
import { cn } from "../../utils/cn";

export interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  type: "pdf" | "image" | "code" | "video" | "zip" | string;
}

interface BentoFileManagerProps {
  title: string;
  files: FileItem[];
  className?: string;
}

export function BentoFileManager({ title, files, className }: BentoFileManagerProps) {
  const getFileIcon = (type: string) => {
    switch(type) {
      case "pdf": return <FileText className="w-5 h-5 text-rose-500" />;
      case "image": return <FileImage className="w-5 h-5 text-blue-500" />;
      case "code": return <FileCode className="w-5 h-5 text-emerald-500" />;
      case "video": return <Film className="w-5 h-5 text-purple-500" />;
      case "zip": return <FileArchive className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case "pdf": return "bg-rose-50";
      case "image": return "bg-blue-50";
      case "code": return "bg-emerald-50";
      case "video": return "bg-purple-50";
      case "zip": return "bg-amber-50";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className={cn("bg-card text-card-foreground shadow-crm-md border border-border p-0 rounded-[27px] flex flex-col overflow-hidden", className)}>
      <div className="p-6 border-b border-border/50 bg-secondary/20">
        <h3 className="text-sm font-semibold text-muted-foreground  ">{title}</h3>
      </div>
      
      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-border/40">
          {files.map((file) => (
            <li key={file.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors group">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", getIconBg(file.type))}>
                {getFileIcon(file.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <button 
                  type="button"
                  className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-0 text-left w-full"
                >
                  {file.name}
                </button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="  font-bold text-[11px]">{file.type}</span>
                  <span>•</span>
                  <span>{file.size}</span>
                </div>
              </div>
              
              <div className="text-xs font-medium text-muted-foreground hidden sm:block whitespace-nowrap">
                {file.date}
              </div>
              
               <button 
                 type="button"
                 aria-label="Больше действий"
                 className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0"
               >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

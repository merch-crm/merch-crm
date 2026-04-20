"use client";

import React from "react";
import { Plus, FolderOpen, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function DropdownWithDescriptions() {
  return (
    <div className="flex justify-center p-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button color="gray" variant="solid" className="rounded-element px-6 h-12 text-sm font-black bg-slate-100 hover:bg-slate-200 text-slate-900 border-none shadow-sm transition-all active:scale-95">
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 p-2 rounded-card bg-white border border-border shadow-3xl animate-in zoom-in-95 duration-200" align="start">
          <DropdownItem icon={<Plus className="size-4" />} 
            label="New file" 
            description="Create a new file" 
            shortcut="⌘N" 
          />
          <DropdownItem icon={<FolderOpen className="size-4" />} 
            label="Open file" 
            description="Open an existing file" 
            shortcut="⌘O" 
          />
          <DropdownItem icon={<Save className="size-4" />} 
            label="Save file" 
            description="Save the current file" 
            shortcut="⌘S" 
          />
          <DropdownMenuSeparator className="my-2 bg-slate-100" />
          <DropdownItem icon={<Trash2 className="size-4 text-rose-500" />} 
            label="Delete file" 
            description="Move to trash" 
            shortcut="⌘⇧D" 
            color="red"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DropdownItem({ 
  icon, 
  label, 
  description, 
  shortcut, 
  color = "gray" 
}: { 
  icon: React.ReactNode, 
  label: string, 
  description: string, 
  shortcut: string,
  color?: "gray" | "red"
}) {
  return (
    <DropdownMenuItem className={cn( "flex items-start gap-3 p-3 rounded-element cursor-pointer transition-colors focus:bg-slate-50 outline-none", color === "red" ? "hover:bg-rose-50" : "" )}>
      <div className={cn(
        "flex h-8 items-start justify-center pt-1 shrink-0",
        color === "red" ? "text-rose-500" : "text-slate-400"
      )}>
        {icon}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className={cn(
          "text-sm font-bold",
          color === "red" ? "text-rose-600" : "text-slate-900"
        )}>{label}</span>
        <span className="text-xs font-medium text-slate-400 truncate">{description}</span>
      </div>
      <div className="ms-auto flex items-center h-5 px-1.5 rounded-md bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-400 shadow-sm mt-0.5">
        {shortcut}
      </div>
    </DropdownMenuItem>
  );
}

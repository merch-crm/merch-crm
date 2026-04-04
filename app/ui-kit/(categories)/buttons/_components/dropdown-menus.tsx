"use client";

import React from "react";
import { ComponentShowcase } from "@/components/ui-kit";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus, Mail, Settings } from "lucide-react";

export function DropdownMenus() {
  return (
    <ComponentShowcase 
      title="Контекстное меню" 
      source="custom" 
      desc="Выпадающее меню для дополнительных действий и опций." 
    >
      <div className="flex items-center justify-center py-10 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-2xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              <MoreHorizontal className="size-4 text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-3xl border-slate-100 shadow-2xl bg-white/80 backdrop-blur-xl">
            <DropdownMenuLabel className="px-3 py-2 text-[11px] font-black   text-slate-400">Действия</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-50 mx-1 my-1" />
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-2xl focus:bg-slate-50 focus:text-slate-900 cursor-pointer transition-all group">
              <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-focus:bg-indigo-50 group-focus:text-indigo-600 transition-all">
                <UserPlus className="size-4" />
              </div>
              <span className="text-sm font-bold text-slate-700">Назначить</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-2xl focus:bg-slate-50 focus:text-slate-900 cursor-pointer transition-all group">
              <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-focus:bg-emerald-50 group-focus:text-emerald-600 transition-all">
                <Mail className="size-4" />
              </div>
              <span className="text-sm font-bold text-slate-700">Написать</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-50 mx-1 my-1" />
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-2xl focus:bg-slate-50 focus:text-slate-900 cursor-pointer transition-all group">
              <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-focus:bg-slate-900 group-focus:text-white transition-all">
                <Settings className="size-4" />
              </div>
              <span className="text-sm font-bold text-slate-700">Настройки</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ComponentShowcase>
  );
}

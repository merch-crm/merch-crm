"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

export function MobileSidebarTrigger() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <div className="flex flex-col items-center gap-1 p-2 rounded-[14px] w-16 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                    <div className="p-1.5 rounded-[10px]">
                        <Menu className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold">Меню</span>
                </div>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r border-slate-200/60 w-[80%] max-w-[300px]">
                <Sidebar className="h-full border-none shadow-none" />
            </SheetContent>
        </Sheet>
    );
}

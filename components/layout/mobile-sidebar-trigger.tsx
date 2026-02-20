"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet-dialog";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface UserProp {
    name: string;
    email: string;
    roleName: string;
    departmentName: string;
    avatar?: string | null;
}

export function MobileSidebarTrigger({ user }: { user: UserProp }) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 transition-all duration-300 border-none bg-transparent outline-none p-0"
                >
                    <div className="relative z-10 flex flex-col items-center gap-0.5">
                        <div className="p-1 rounded-xl transition-transform duration-300">
                            <Menu className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <span className="text-xs font-bold tracking-tight">Меню</span>
                    </div>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-0 border-t border-slate-200/60 h-auto max-h-[85vh] rounded-t-[20px] pb-8">
                <SheetTitle className="sr-only">Навигационное меню</SheetTitle>
                <SheetDescription className="sr-only">Выберите раздел для перехода</SheetDescription>
                <div className="mx-auto w-12 h-1.5 bg-slate-200 rounded-full mt-3 mb-1" />
                <Sidebar className="border-none shadow-none" user={user} />
            </SheetContent>
        </Sheet>
    );
}

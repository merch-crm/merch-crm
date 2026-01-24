"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";

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
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard SSR hydration pattern
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="flex flex-col items-center gap-1 p-2 rounded-[14px] w-16 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent outline-none">
                    <div className="p-1.5 rounded-[10px]">
                        <Menu className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold">Меню</span>
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r border-slate-200/60 w-[80%] max-w-[300px]">
                <Sidebar className="h-full border-none shadow-none" user={user} />
            </SheetContent>
        </Sheet>
    );
}

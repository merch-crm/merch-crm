"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Поиск..."
                        className="h-9 w-full rounded-xl border border-input bg-transparent pl-9 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="flex items-center gap-3 border-l border-border pl-4">
                    <div className="flex flex-col text-right hidden sm:flex">
                        <span className="text-sm font-medium">Admin User</span>
                        <span className="text-xs text-muted-foreground">Администратор</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        AD
                    </div>
                </div>
            </div>
        </header>
    )
}

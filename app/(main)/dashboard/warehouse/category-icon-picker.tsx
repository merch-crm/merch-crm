"use client";

import React, { useState, createElement } from"react";
import { Search, ChevronDown } from"lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from"@/components/ui/popover";
import { cn } from"@/lib/utils";
import { ICON_GROUPS, getDynamicGradient, ALL_ICONS_MAP } from"./category-utils";

interface CategoryIconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
    color: string;
    className?: string;
}

const GROUP_SHORT: Record<string, string> = {"ОДЕЖДА":"Одежда","СКЛАД И ЛОГИСТИКА":"Склад","ПРОИЗВОДСТВО И ИНСТРУМЕНТЫ":"Произв.","ФИНАНСЫ И ПРОДАЖИ":"Финансы","БИЗНЕС И КЛИЕНТЫ":"Бизнес",
};

export function CategoryIconPicker({ value, onChange, color, className }: CategoryIconPickerProps) {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState(ICON_GROUPS[0]?.name ??"");

    const CurrentIcon = ALL_ICONS_MAP[value] || ALL_ICONS_MAP["tshirt-custom"];
    const currentIconEntry = ICON_GROUPS.flatMap(g => g.icons).find(i => i.name === value);

    const isSearching = search.trim().length > 0;

    const searchResults = isSearching
        ? ICON_GROUPS.flatMap(g => g.icons).filter(icon =>
            icon.label.toLowerCase().includes(search.toLowerCase()) ||
            icon.name.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    const currentGroupIcons = isSearching
        ? []
        : (ICON_GROUPS.find(g => g.name === tab)?.icons ?? []);

    return (
        <Popover
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setSearch("");
            }}
            modal={true}
        >
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn("w-full h-full min-h-[80px] rounded-[var(--radius-inner)] border-2 border-dashed border-slate-200 hover:border-primary/40 bg-white hover:bg-primary/[0.02] transition-all duration-200 flex items-center justify-center group outline-none gap-3 px-4",
                        isOpen &&"border-primary/30",
                        className
                    )}
                >
                    <div
                        className={cn("w-12 h-12 rounded-[14px] shrink-0 flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-[1.06]"
                        )}
                        style={getDynamicGradient(color)}
                    >
                        <CurrentIcon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 flex flex-col items-start justify-center min-w-0 py-1">
                        <div className="text-sm font-black text-slate-900 leading-tight">{currentIconEntry?.label ??"Иконка"}</div>
                        <span className="text-[11px] font-medium text-slate-500 line-clamp-1">Нажмите, чтобы изменить</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-slate-300 shrink-0 transition-transform duration-200",
                        isOpen &&"rotate-180"
                    )} />
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] flex flex-col p-0 overflow-hidden rounded-2xl border border-slate-200/80 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] bg-white"
                align="start"
                side="bottom"
                sideOffset={8}
                avoidCollisions={false}
            >
                {/* Search Bar */}
                <div className="p-3 pb-2 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Поиск иконки..."
                            className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                </div>

                {/* Tabs */}
                {!isSearching && (
                    <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                        {ICON_GROUPS.map((g) => (
                            <button
                                key={g.name}
                                type="button"
                                onClick={() => setTab(g.name)}
                                className={cn("shrink-0 h-6 px-2.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap",
                                    tab === g.name
                                        ?"bg-slate-900 text-white"
                                        :"text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                )}
                            >
                                {GROUP_SHORT[g.name] ?? g.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Icons */}
                <div
                    className="overflow-y-auto overflow-x-hidden h-[120px] sm:h-[194px] custom-scrollbar"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <div className="px-3 pt-1 pb-4">
                        {isSearching ? (
                            searchResults.length > 0 ? (
                                <div className="grid grid-cols-5 gap-1.5">
                                    {searchResults.map(icon => (
                                        <IconCell
                                            key={icon.name}
                                            icon={icon}
                                            isSelected={value === icon.name}
                                            color={color}
                                            onSelect={(name) => { onChange(name); setIsOpen(false); }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center">
                                    <p className="text-xs font-bold text-slate-400">Ничего не найдено</p>
                                </div>
                            )
                        ) : (
                            <div className="grid grid-cols-5 gap-1.5">
                                {currentGroupIcons.map(icon => (
                                    <IconCell
                                        key={icon.name}
                                        icon={icon}
                                        isSelected={value === icon.name}
                                        color={color}
                                        onSelect={(name) => { onChange(name); setIsOpen(false); }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function IconCell({
    icon,
    isSelected,
    color,
    onSelect,
}: {
    icon: { name: string; icon: React.ComponentType<{ className?: string }>; label: string };
    isSelected: boolean;
    color: string;
    onSelect: (name: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(icon.name)}
            title={icon.label}
            className={cn("flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all duration-150 group/c",
                isSelected
                    ? cn("text-white shadow-sm")
                    :"text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:scale-95"
            )}
            style={isSelected ? getDynamicGradient(color) : {}}
        >
            {createElement(icon.icon, {
                className: cn("w-5 h-5 shrink-0",
                    isSelected ?"stroke-[2.5]" :"stroke-[1.5]"
                )
            })}
            <span className={cn("text-xs font-bold leading-tight text-center w-full",
                isSelected ?"text-white/90" :"text-slate-400 group-hover/c:text-slate-600"
            )}>
                {icon.label}
            </span>
        </button>
    );
}

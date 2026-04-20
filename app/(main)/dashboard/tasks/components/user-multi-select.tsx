"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";


interface UserMultiSelectProps {
 users: Array<{ id: string; name: string; image?: string | null; email?: string }>;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 placeholder?: string;
 disabled?: boolean;
 maxDisplay?: number;
}

export function UserMultiSelect({
 users,
 selectedIds,
 onSelectionChange,
 placeholder = "Выберите пользователей",
 disabled = false,
 maxDisplay = 3,
}: UserMultiSelectProps) {
 const [open, setOpen] = useState(false);
 const [search, setSearch] = useState("");

 const filteredUsers = useMemo(() => {
  const safeUsers = users || [];
  if (!search.trim()) return safeUsers;
  const query = search.toLowerCase();
  return safeUsers.filter(
   (user) =>
    user.name?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query)
  );
 }, [users, search]);

 const selectedUsers = useMemo(() => {
  return (users || []).filter((user) => selectedIds.includes(user.id));
 }, [users, selectedIds]);

 const toggleUser = (userId: string) => {
  if (selectedIds.includes(userId)) {
   onSelectionChange(selectedIds.filter((id) => id !== userId));
  } else {
   onSelectionChange([...selectedIds, userId]);
  }
 };

 const removeUser = (userId: string, e: React.MouseEvent) => {
  e.stopPropagation();
  onSelectionChange(selectedIds.filter((id) => id !== userId));
 };

 const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.split(" ");
  return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
 };

 return (
  <Popover open={open} onOpenChange={setOpen}>
   <PopoverTrigger asChild>
    <Button variant="outline" color="gray" role="combobox" aria-expanded={open} disabled={disabled} className={cn( "w-full justify-between min-h-12 h-auto py-2.5 px-4 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white transition-colors", selectedIds.length === 0 && "text-slate-500" )}>
     <div className="flex flex-wrap gap-1.5 flex-1">
      {selectedIds.length === 0 ? (
       <span>{placeholder}</span>
      ) : (
        <>
        {selectedUsers.slice(0, maxDisplay).map((user) => (
         <Badge key={user.id} className="flex items-center gap-1.5 pr-1 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg" color="gray">
          <span className="max-w-[100px] truncate text-xs font-medium">
           {user.name.split(" ")[0]} {user.name.split(" ")[1]?.[0] ? user.name.split(" ")[1][0] + "." : ""}
          </span>
          <span
           role="button"
           tabIndex={0}
           onClick={(e) => removeUser(user.id, e)}
           onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
             removeUser(user.id, e as unknown as React.MouseEvent);
            }
           }}
           className="ml-1 p-0.5 rounded-full hover:bg-violet-300 transition-colors cursor-pointer"
          >
           <X className="h-3 w-3" />
          </span>
         </Badge>
        ))}
        {selectedIds.length > maxDisplay && (
         <Badge className="bg-slate-100 text-slate-600 rounded-lg" color="gray">
          +{selectedIds.length - maxDisplay}
         </Badge>
        )}
       </>
      )}
     </div>
     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
    </Button>
   </PopoverTrigger>
   <PopoverContent className="w-[320px] p-0 rounded-2xl border-slate-200 shadow-xl" align="start">
    <div className="p-3 border-b border-slate-100">
     <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)}
       className="pl-9 rounded-xl border-slate-200"
      />
     </div>
    </div>
    <div className="max-h-64 overflow-y-auto p-2">
     {filteredUsers.length === 0 ? (
      <div className="py-8 text-center text-sm text-slate-500">
       Пользователи не найдены
      </div>
     ) : (
      filteredUsers.map((user) => {
       const isSelected = selectedIds.includes(user.id);
       return (
        <button type="button"
         key={user.id}
         onClick={() => toggleUser(user.id)}
         className={cn(
          "flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all",
          "hover:bg-slate-50",
          isSelected && "bg-violet-50 hover:bg-violet-100"
         )}
        >
         <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-400 text-white text-xs font-semibold">
           {getInitials(user.name)}
          </AvatarFallback>
         </Avatar>
         <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
           {user.name}
          </p>
          <p className="text-xs text-slate-500 truncate">
           {user.email}
          </p>
         </div>
         {isSelected && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
           <Check className="h-3.5 w-3.5 text-white" />
          </div>
         )}
        </button>
       );
      })
     )}
    </div>
    {selectedIds.length > 0 && (
     <div className="p-2 border-t border-slate-100 bg-slate-50/50">
      <Button variant="ghost" color="gray" size="sm" onClick={() => onSelectionChange([])}
       className="w-full text-slate-500 hover:text-slate-700 rounded-xl"
      >
       Очистить выбор ({selectedIds.length})
      </Button>
     </div>
    )}
   </PopoverContent>
  </Popover>
 );
}

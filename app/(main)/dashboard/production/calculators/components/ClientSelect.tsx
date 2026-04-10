/**
 * @fileoverview Компонент выбора клиента с поиском
 * @module calculators/components/ClientSelect
 */

'use client';

import * as React from 'react';
import { Check, ChevronDown, Search, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { getClients } from '@/app/(main)/dashboard/clients/actions/core/queries';
import { useDebounce } from '@/hooks/use-debounce';

interface ClientEntry {
 id: string;
 displayName: string;
 company: string | null;
 phone: string;
}

interface ClientSelectProps {
 value?: string; // clientId
 onSelect: (client: ClientEntry | null) => void;
 placeholder?: string;
 defaultValue?: string;
}

export function ClientSelect({
 value,
 onSelect,
 placeholder = "Выберите клиента...",
 defaultValue = "",
}: ClientSelectProps) {
 const [open, setOpen] = React.useState(false);
 const [search, setSearch] = React.useState(defaultValue);
 const [clients, setClients] = React.useState<ClientEntry[]>([]);
 const [isLoading, setIsLoading] = React.useState(false);
 const debouncedSearch = useDebounce(search, 300);

 // Выбранный клиент (для отображения в кнопке)
 const [selectedClient, setSelectedClient] = React.useState<ClientEntry | null>(null);

 // Поиск клиентов при изменении debouncedSearch
 React.useEffect(() => {
  async function fetchClients() {
   if (!debouncedSearch && !open) return;
   
   setIsLoading(true);
   try {
    const result = await getClients({ search: debouncedSearch, limit: 10 });
    const clientsData = result.success ? result.data?.clients : null;
    if (clientsData) {
     const mapped = clientsData.map(c => ({
      id: c.id,
      displayName: c.displayName,
      company: c.company ?? null,
      phone: c.phone || '',
     }));
     setClients(mapped);
     
     // Если есть value, но нет selectedClient, пытаемся найти его в результатах
     if (value && !selectedClient) {
      const found = mapped.find(c => c.id === value) ?? null;
      if (found) setSelectedClient(found);
     }
    }
   } catch (error) {
    console.error('Failed to fetch clients:', error);
   } finally {
    setIsLoading(false);
   }
  }

  fetchClients();
 }, [debouncedSearch, open, value, selectedClient]);

 // Сброс выбора
 const handleClear = (e: React.MouseEvent) => {
  e.stopPropagation();
  onSelect(null);
  setSelectedClient(null);
  setSearch("");
 };

 return (
  <Popover open={open} onOpenChange={setOpen}>
   <PopoverTrigger asChild>
    <button
     type="button"
     aria-expanded={open}
     className={cn(
      "w-full px-4 h-12 bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-[12px] text-left transition-colors flex items-center justify-between focus:outline-none",
      open ? "border-slate-300 bg-white" : ""
     )}
    >
     <div className="flex items-center gap-2 truncate text-sm">
      {selectedClient ? (
       <div className="flex flex-col truncate">
        <span className="truncate font-semibold text-slate-900">{selectedClient.displayName}</span>
       </div>
      ) : (
       <span className="text-slate-400 font-semibold">{placeholder}</span>
      )}
     </div>
     <ChevronDown className={cn("shrink-0 transition-transform duration-300 w-4 h-4 text-slate-400", open ? "rotate-180" : "")} />
    </button>
   </PopoverTrigger>
   
   <PopoverContent className="!p-0 !bg-white !border !border-slate-200 !shadow-lg !w-auto !rounded-[12px] !ring-0 !overflow-hidden" align="start" sideOffset={6} collisionPadding={8}>
    <div className="flex flex-col max-h-[350px] w-[var(--radix-popover-trigger-width)] h-full">
     <div className="pb-2 border-b border-slate-100/60 mb-1 block px-1.5 pt-1.5 bg-white sticky top-0 z-10">
      <div className="relative">
       <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
       <Input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск клиента..."
        className="w-full h-11 pl-10 pr-3 rounded-[14px] bg-slate-50/50 border border-slate-200/60 shadow-none text-sm font-bold focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-slate-100 focus-visible:border-slate-300 transition-all placeholder:text-slate-400"
       />
      </div>
     </div>

     <div className="overflow-y-auto scrollbar-hide flex-1 px-1 custom-scrollbar">
      {isLoading && (clients?.length || 0) === 0 && (
       <div className="py-6 text-center text-xs font-bold text-muted-foreground/50">Загрузка...</div>
      )}
      {!isLoading && (clients?.length || 0) === 0 && search && (
       <div className="py-6 text-center text-xs font-bold text-muted-foreground/50">Клиент не найден</div>
      )}
      {!isLoading && (clients?.length || 0) === 0 && !search && (
       <div className="py-6 text-center text-xs font-bold text-muted-foreground/50">Начните вводить имя...</div>
      )}
      
      <div className="flex flex-col gap-0.5">
       {(clients || []).map((client) => {
        const isSelected = value === client.id;
        return (
         <button
          key={client.id}
          type="button"
          onClick={() => {
           onSelect(client);
           setSelectedClient(client);
           setOpen(false);
          }}
          className={cn("flex flex-col items-start gap-1 justify-center px-3 py-2.5 outline-none cursor-pointer focus:outline-none transition-colors relative text-left rounded-[10px] w-full",
           isSelected ? "bg-slate-100 shadow-sm" : "bg-white hover:bg-slate-50"
          )}
         >
          <div className="flex items-center justify-between w-full">
           <span className={cn("text-sm truncate", isSelected ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
            {client.displayName}
           </span>
           {isSelected && <Check className="w-4 h-4 text-indigo-600 stroke-[3] shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium leading-tight truncate text-slate-400">
           <span className="font-mono tabular-nums">{client.phone}</span>
           {client.company && (
            <span className="flex items-center gap-1">
             <span className="w-1 h-1 rounded-full bg-slate-300" />
             <Building2 className="h-3 w-3" />
             {client.company}
            </span>
           )}
          </div>
         </button>
        );
       })}
      </div>
     </div>
     
     <div className="border-t border-slate-100 p-1.5 mt-1 bg-slate-50/50">
      <button
       type="button"
       onClick={handleClear}
       className="w-full flex items-center justify-center h-9 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-[8px] transition-colors"
      >
       Сбросить выбор
      </button>
     </div>
    </div>
   </PopoverContent>
  </Popover>
 );
}

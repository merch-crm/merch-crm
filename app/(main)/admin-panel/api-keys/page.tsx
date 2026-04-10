"use client";

import { useEffect, useState } from "react";
import { getApiKeysAction, createApiKey, revokeApiKey, type ApiKey } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key, Trash2, Copy, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

// ApiKeyData is now ApiKey from actions

export default function ApiKeysPage() {
 const [keys, setKeys] = useState<ApiKey[]>([]);
 const [loading, setLoading] = useState(true);
 const [creating, setCreating] = useState(false);
 const [newKeyName, setNewKeyName] = useState("");
 const [copiedId, setCopiedId] = useState<string | null>(null);

 useEffect(() => {
  loadKeys();
 }, []);

 async function loadKeys() {
  setLoading(true);
  const result = await getApiKeysAction();
  if (result.success && result.data) {
   setKeys(result.data);
  }
  setLoading(false);
 }

 async function handleCreate() {
  if (!newKeyName.trim()) return;
  setCreating(true);
  const result = await createApiKey({ name: newKeyName });
  if (result.success) {
   toast.success("API ключ создан");
   setNewKeyName("");
   loadKeys();
  } else {
   toast.error("Не удалось создать ключ");
  }
  setCreating(false);
 }

 async function handleRevoke(id: string) {
  // В будущем заменим на кастомный диалог, пока просто убираем блокирующий confirm для соответствия стандартам
  const result = await revokeApiKey({ id });
  if (result.success) {
   toast.success("Ключ отозван");
   loadKeys();
  } else {
   toast.error("Не удалось отозвать ключ");
  }
 }

 function copyToClipboard(text: string, id: string) {
  navigator.clipboard.writeText(text);
  setCopiedId(id);
  setTimeout(() => setCopiedId(null), 2000);
  toast.success("Скопировано в буфер обмена");
 }

 if (loading && keys.length === 0) {
  return (
   <div className="flex flex-col items-center justify-center p-24 space-y-3">
    <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
    <p className="text-sm text-slate-500 font-bold">Загружаем ключи доступа...</p>
   </div>
  );
 }

 return (
  <div className="space-y-3 pb-20">
   <div className="flex items-center gap-3">
    <div className="w-14 h-14 bg-primary/10 rounded-[22px] flex items-center justify-center border border-primary/20 shadow-sm shadow-primary/10">
     <Key className="w-7 h-7 text-primary" />
    </div>
    <div>
     <h1 className="text-2xl font-black text-slate-900 ">API Ключи доступа</h1>
     <p className="text-slate-500 text-xs font-bold mt-1">Публичный API v1.0 • Безопасная интеграция</p>
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
    <div className="lg:col-span-1">
     <Card className="border-2 border-slate-100 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="bg-slate-50/50">
       <CardTitle className="text-lg font-black ">Выпустить новый ключ</CardTitle>
       <CardDescription className="text-xs font-medium">Создайте уникальный ключ для внешней интеграции.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
       <div className="space-y-2">
        <label className="text-xs font-black text-slate-500 px-1">Название ключа</label>
        <Input placeholder="Напр., Website Integration" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)}
         className="rounded-2xl border-2 focus-visible:ring-primary/20 h-12 font-bold"
        />
       </div>
       <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()} className="w-full rounded-2xl h-12 font-black shadow-lg shadow-primary/20">
        {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
        Выпустить ключ
       </Button>
       <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
        <p className="text-xs text-amber-800 font-bold leading-relaxed">
         ВАЖНО: Ключ будет показан только один раз при создании. Сохраните его в безопасном месте.
        </p>
       </div>
      </CardContent>
     </Card>
    </div>

    <div className="lg:col-span-2">
     <Card className="border-2 border-slate-100 shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
      <CardHeader className="border-b border-slate-100">
       <CardTitle className="flex items-center justify-between">
        <span className="font-black text-lg ">Активные ключи</span>
        <Badge className="rounded-lg h-6 font-bold" color="neutral">{keys.length}</Badge>
       </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
       <div className="divide-y divide-slate-50">
        {keys.map((key) => (
         <div key={key.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
          <div className="space-y-1.5 flex-1 pr-8">
           <div className="flex items-center gap-3">
            <h3 className="font-black text-slate-800 ">{key.name}</h3>
            <Badge color="success" className="h-5 text-xs px-1.5 rounded-md font-black">Active</Badge>
           </div>
           <code className="text-xs text-slate-400 font-mono bg-slate-100/50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block">
            {key.key.substring(0, 10)}**************************
           </code>
           <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
              Создан: {format(new Date(key.createdAt), "dd MMM yyyy", { locale: ru })}
            </span>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
              Использован: {key.lastUsedAt ? format(new Date(key.lastUsedAt), "dd.MM HH:mm", { locale: ru }) : "Никогда"}
            </span>
           </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
           <Button variant="outline" color="neutral" size="icon" className="rounded-xl border-2 hover:bg-white hover:text-primary transition-all shadow-sm" onClick={() => copyToClipboard(key.key, key.id)}
           >
            {copiedId === key.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
           </Button>
           <Button variant="outline" color="neutral" size="icon" className="rounded-xl border-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm" onClick={() => handleRevoke(key.id)}
           >
            <Trash2 className="w-4 h-4" />
           </Button>
          </div>
         </div>
        ))}

        {keys.length === 0 && (
         <div className="p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto opacity-50">
           <Key className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-400 font-black text-sm">Ключи доступа не созданы</p>
         </div>
        )}
       </div>
      </CardContent>
     </Card>
    </div>
   </div>
  </div>
 );
}

"use client";

import React, { useEffect, useState } from "react";
import { getHeatmapData } from "../actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageStat {
 stageName: string;
 appTypeId: string | null;
 avgDurationMinutes: number;
 totalTasks: number;
 estimatedTime: number;
 efficiency: number;
}

export function HeatmapView() {
 const [data, setData] = useState<StageStat[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  async function fetchData() {
   try {
    const result = await getHeatmapData({ days: 14 });
    if (result.success && result.data) {
     setData(result.data);
    } else {
     setError("Failed to load data");
    }
   } catch (_err) {
    setError("An unexpected error occurred");
   } finally {
    setLoading(false);
   }
  }
  fetchData();
 }, []);

 if (loading) {
  return (
   <div className="flex flex-col items-center justify-center p-12 space-y-3">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <p className="text-sm text-slate-500 animate-pulse font-medium">Анализируем производственные логи...</p>
   </div>
  );
 }

 if (error) {
  return (
   <div className="p-8 text-center text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 font-medium">
    {error}
   </div>
  );
 }

 return (
  <div className="space-y-3">
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {(data || []).map((stage) => {
     const isBottleneck = stage.efficiency > 1.2; // 20% slower than estimated
     const isEfficient = stage.efficiency < 0.9; // 10% faster than estimated

     return (
      <Card key={stage.stageName} className={cn( "overflow-hidden border transition-all hover:shadow-md", isBottleneck ? "border-rose-200 bg-rose-50/10" : isEfficient ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200" )}>
       <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
         <CardTitle className="text-base font-bold truncate pr-6">{stage.stageName}</CardTitle>
         {isBottleneck ? (
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
         ) : isEfficient ? (
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
         ) : (
          <Clock className="w-5 h-5 text-slate-400 shrink-0" />
         )}
        </div>
        <CardDescription className="text-xs">
         {stage.totalTasks} задач выполнено
        </CardDescription>
       </CardHeader>
       <CardContent className="space-y-3">
        <div className="space-y-2">
         <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-500">Эффективность</span>
          <span className={cn(
            "font-bold",
            isBottleneck ? "text-rose-600" : isEfficient ? "text-emerald-600" : "text-slate-700"
          )}>
            {Math.round(stage.efficiency * 100)}%
          </span>
         </div>
         <Progress value={isNaN(stage.efficiency) ? 0 : Math.min(stage.efficiency * 50, 100)} className={cn( "h-2", isBottleneck ? "bg-rose-100" : "bg-slate-100" )} />
         <p className="text-xs text-slate-400 leading-tight italic">
          * Отношение фактического времени к плановому
         </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
         <div className="text-center">
          <p className="text-xs text-slate-400 font-bold ">Факт</p>
          <p className="text-sm font-bold text-slate-700">{stage.avgDurationMinutes}м</p>
         </div>
         <div className="text-center">
          <p className="text-xs text-slate-400 font-bold ">План</p>
          <p className="text-sm font-bold text-slate-500">{stage.estimatedTime}м</p>
         </div>
         <div className="text-right">
          <Badge color={isBottleneck ? "danger" : isEfficient ? "success" : "neutral"} className="h-5 text-xs px-1.5 rounded-md font-bold">
           {isBottleneck ? "УЗКОЕ МЕСТО" : isEfficient ? "ОПТИМАЛЬНО" : "НОРМА"}
          </Badge>
         </div>
        </div>
       </CardContent>
      </Card>
     );
    })}
   </div>

   {(!data || data?.length === 0) && (
    <div className="p-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
     Данные за выбранный период отсутствуют. 
     <br/>
     Пожалуйста, проверьте наличие завершенных производственных задач.
    </div>
   )}
  </div>
 );
}

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

export function TasksWidget() {
 return (
  <Card>
   <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">Мои задачи</CardTitle>
    <ListTodo className="h-4 w-4 text-muted-foreground" />
   </CardHeader>
   <CardContent>
    <p className="text-xs text-muted-foreground">Виджет в разработке</p>
   </CardContent>
  </Card>
 );
}

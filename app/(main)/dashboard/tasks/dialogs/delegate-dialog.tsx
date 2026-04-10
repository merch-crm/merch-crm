"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroupRoot, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Share2, Loader2, CheckCircle2, User as UserIcon } from "lucide-react";
import { delegateTask } from "../actions/delegate-actions";
import type { Task } from "@/lib/types/tasks";

interface DelegateDialogProps {
 task: Task;
 open: boolean;
 onOpenChange: (open: boolean) => void;
 users: Array<{ id: string; name: string; image?: string | null; email?: string }>;
 currentUserId: string;
 onTaskUpdated?: () => void;
}

export function DelegateDialog({
 task,
 open,
 onOpenChange,
 users,
 currentUserId,
 onTaskUpdated,
}: DelegateDialogProps) {
 const router = useRouter();
 const [selectedUserId, setSelectedUserId] = useState<string>("");
 const [reason, setReason] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Filter out current user and existing assignees
 const availableUsers = (users || []).filter(
  (user) =>
   user.id !== currentUserId &&
   !task.assignees?.some((a) => a.userId === user.id)
 );

 const handleSubmit = async () => {
  if (!selectedUserId) {
   toast.error("Выберите нового исполнителя");
   return;
  }

  setIsSubmitting(true);
  try {
   const result = await delegateTask({
    taskId: task.id,
    newAssigneeIds: [selectedUserId],
   });

   if (result.success) {
    const user = users.find((u) => u.id === selectedUserId);
    toast.success("Задача делегирована", {
     description: `Исполнитель: ${user?.name}`,
     icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    });
    onOpenChange(false);
    onTaskUpdated?.();
    router.refresh();
    setSelectedUserId("");
    setReason("");
   } else {
    toast.error(result.error || "Не удалось делегировать задачу");
   }
  } catch (_error) {
   toast.error("Произошла ошибка");
  } finally {
   setIsSubmitting(false);
  }
 };

 return (
  <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent className="max-w-md">
    <DialogHeader>
     <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-primary/10">
       <Share2 className="h-5 w-5 text-primary" />
      </div>
      <div>
       <DialogTitle>Делегировать задачу</DialogTitle>
       <DialogDescription className="mt-1">
        Передайте задачу другому сотруднику
       </DialogDescription>
      </div>
     </div>
    </DialogHeader>

    <div className="space-y-3 py-4">
     <div className="space-y-3">
      <Label className="text-sm font-medium">
       Выберите нового исполнителя
      </Label>
      {availableUsers.length === 0 ? (
       <p className="text-sm text-muted-foreground">
        Нет доступных пользователей для делегирования
       </p>
      ) : (
       <RadioGroupRoot value={selectedUserId} onValueChange={setSelectedUserId} className="space-y-2">
        {availableUsers.map((user) => (
         <div
          key={user.id}
          role="button"
          tabIndex={0}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
           selectedUserId === user.id
            ? "border-primary bg-primary/5"
            : "border-transparent bg-muted/50 hover:bg-muted"
          }`}
          onClick={() => setSelectedUserId(user.id)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedUserId(user.id); }}
         >
          <RadioGroupItem value={user.id} id={user.id} />
          <Avatar className="h-9 w-9">
           <AvatarImage src={user.image || undefined} />
           <AvatarFallback>
            <UserIcon className="h-4 w-4" />
           </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
           <p className="font-medium text-sm">{user.name}</p>
           <p className="text-xs text-muted-foreground truncate">
            {user.email}
           </p>
          </div>
         </div>
        ))}
       </RadioGroupRoot>
      )}
     </div>

     <div className="space-y-2">
      <Label htmlFor="reason" className="text-sm font-medium">
       Причина делегирования (необязательно)
      </Label>
      <Textarea id="reason" placeholder="Укажите причину..." value={reason} onChange={(e) => setReason(e.target.value)}
       rows={3}
       className="resize-none"
      />
     </div>
    </div>

    <DialogFooter>
     <Button variant="outline" onClick={() => onOpenChange(false)}>
      Отмена
     </Button>
     <Button onClick={handleSubmit} disabled={!selectedUserId || isSubmitting} className="bg-gradient-to-r from-primary to-violet-600">
      {isSubmitting ? (
       <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Делегирование...
       </>
      ) : (
       <>
        <Share2 className="h-4 w-4 mr-2" />
        Делегировать
       </>
      )}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 );
}

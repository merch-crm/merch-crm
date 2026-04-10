"use client";

interface UserTasksSectionProps {
 userId: string;
 userName?: string;
}

export function UserTasksSection({ userId: _userId, userName: _userName }: UserTasksSectionProps) {
 return (
  <div className="mt-6">
   <h3 className="text-lg font-semibold mb-4">Задачи сотрудника</h3>
   <div className="p-8 rounded-xl border border-dashed text-center">
    <p className="text-muted-foreground">Список задач в разработке</p>
   </div>
  </div>
 );
}

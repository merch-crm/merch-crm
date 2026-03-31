"use client";

import type { Task } from "@/lib/types/tasks";

interface ProfileTasksWidgetProps {
  tasks?: Task[];
  userId?: string;
  isOwnProfile?: boolean;
}

export function ProfileTasksWidget({ tasks: _tasks, userId: _userId, isOwnProfile: _isOwnProfile }: ProfileTasksWidgetProps = {}) {
  return (
    <div className="p-4 rounded-xl border border-dashed text-center">
      <p className="text-sm text-muted-foreground">Мои активные задачи</p>
    </div>
  );
}

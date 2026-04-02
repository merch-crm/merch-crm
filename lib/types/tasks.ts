// lib/types/tasks.ts

// Enums
export type TaskStatus =
  | "new"
  | "in_progress"
  | "review"
  | "done"
  | "cancelled"
  | "archived";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type TaskType =
  | "general"
  | "design"
  | "production"
  | "acquisition"
  | "delivery"
  | "inventory"
  | "maintenance"
  | "other";

// Checklist Item
export interface ChecklistItem {
  id: string;
  taskId: string;
  text: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Comment
export interface TaskComment {
  id: string;
  taskId: string;
  text: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

// History Entry
export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  userId: string;
  type: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    image?: string | null;
  };
}

// Assignee
export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  assignedBy?: string | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

// Watcher
export interface TaskWatcher {
  id: string;
  taskId: string;
  userId: string;
  addedBy?: string | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

// Dependency
export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  createdBy?: string;
  createdAt: Date;
  dependsOnTask?: {
    id: string;
    title: string;
    status: TaskStatus;
  };
}

// Main Task interface
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  deadline: Date | string;
  departmentId?: string | null;
  creatorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt?: Date | string | null;

  // Delegation
  delegatedByUserId?: string | null;
  delegatedAt?: Date | string | null;
  originalAssigneeId?: string | null;

  // Auto-creation
  isAutoCreated: boolean;
  autoCreatedReason?: string | null;
  autoCreatedSourceType?: string | null;
  autoCreatedSourceId?: string | null;

  // Relations
  creator?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  department?: {
    id: string;
    name: string;
  } | null;
  assignees?: TaskAssignee[];
  watchers?: TaskWatcher[];
  dependencies?: TaskDependency[];
  checklists?: ChecklistItem[];
  comments?: TaskComment[];
  history?: TaskHistoryEntry[];

  // Delegation info
  delegatedBy?: {
    id: string;
    name: string;
  } | null;
}

// Filters
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  departmentId?: string;
  assigneeId?: string;
  creatorId?: string;
  isOverdue?: boolean;
  search?: string;
}

// Filter Preset
export interface TaskFilterPreset {
  id: string;
  name: string;
  filters: TaskFilters;
  isSystem: boolean;
  isFavorite: boolean;
  userId: string;
  createdAt: Date;
}

// Action Result
export interface TaskActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Input types
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  type: TaskType;
  deadline: Date;
  departmentId?: string;
  assigneeIds: string[];
  watcherIds?: string[];
}

export interface DelegateTaskInput {
  taskId: string;
  newAssigneeIds: string[];
  removeCurrentAssignees?: boolean;
}

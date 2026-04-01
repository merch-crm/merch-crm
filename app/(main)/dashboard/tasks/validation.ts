/**
 * Zod-схемы валидации для модуля задач
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const taskStatusSchema = z.enum([
  "new",
  "in_progress",
  "review",
  "done",
  "archived",
  "cancelled",
]);

export const taskPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);

export const taskTypeSchema = z.enum([
  "general",
  "design",
  "production",
  "acquisition",
  "delivery",
  "inventory",
  "maintenance",
  "other",
]);

export const userIdSchema = z.string().uuid("Некорректный ID пользователя");
export const taskIdSchema = z.string().uuid("Некорректный ID задачи");
export const contentSchema = z.string().min(1, "Обязательное поле").max(2000, "Слишком длинный текст");


// ============================================================================
// CREATE TASK
// ============================================================================

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(255, "Название слишком длинное"),
  description: z.string().max(5000, "Описание слишком длинное").optional(),
  priority: taskPrioritySchema.default("normal"),
  type: taskTypeSchema.default("general"),
  deadline: z.coerce.date(),
  departmentId: z.string().uuid().optional(),
  assigneeIds: z
    .array(z.string().uuid())
    .min(1, "Выберите хотя бы одного исполнителя"),
  watcherIds: z.array(z.string().uuid()).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// ============================================================================
// UPDATE TASK
// ============================================================================

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  type: taskTypeSchema.optional(),
  deadline: z.coerce.date().optional(),
  departmentId: z.string().uuid().nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// ============================================================================
// DELEGATE TASK
// ============================================================================

export const delegateTaskSchema = z.object({
  taskId: z.string().uuid(),
  newAssigneeIds: z
    .array(z.string().uuid())
    .min(1, "Выберите хотя бы одного исполнителя"),
  removeCurrentAssignees: z.boolean().default(true),
});

export type DelegateTaskInput = z.infer<typeof delegateTaskSchema>;

// ============================================================================
// ASSIGNEES & WATCHERS
// ============================================================================

export const addAssigneeSchema = z.object({
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const removeAssigneeSchema = z.object({
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const addWatcherSchema = z.object({
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const removeWatcherSchema = z.object({
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
});

// ============================================================================
// DEPENDENCIES
// ============================================================================

export const addDependencySchema = z.object({
  taskId: z.string().uuid(),
  dependsOnTaskId: z.string().uuid(),
});

export const removeDependencySchema = z.object({
  dependencyId: z.string().uuid(),
});

// ============================================================================
// CHECKLIST
// ============================================================================

export const addChecklistItemSchema = z.object({
  taskId: z.string().uuid(),
  content: z.string().min(1, "Текст обязателен").max(500),
  order: z.number().int().nonnegative().optional(),
});

export const toggleChecklistItemSchema = z.object({
  itemId: z.string().uuid(),
  isCompleted: z.boolean(),
});

export const deleteChecklistItemSchema = z.object({
  itemId: z.string().uuid(),
});

// ============================================================================
// COMMENTS
// ============================================================================

export const addCommentSchema = z.object({
  taskId: z.string().uuid(),
  content: z.string().min(1, "Комментарий не может быть пустым").max(2000),
});

// ============================================================================
// ATTACHMENTS
// ============================================================================

export const addAttachmentSchema = z.object({
  taskId: taskIdSchema,
  fileName: z.string().min(1),
  fileKey: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().optional(),
  contentType: z.string().optional(),
});

export const removeAttachmentSchema = z.object({
  attachmentId: z.string().uuid(),
});

// ============================================================================
// AUTO TASKS
// ============================================================================

export const createAutoTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: taskTypeSchema,
  priority: taskPrioritySchema,
  departmentId: z.string().uuid().optional(),
  roleSlug: z.string().optional(),
  sourceType: z.string().min(1),
  sourceId: z.string().min(1),
});


// ============================================================================
// FILTERS
// ============================================================================

export const taskFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  status: z.union([taskStatusSchema, z.array(taskStatusSchema)]).optional(),
  priority: z.union([taskPrioritySchema, z.array(taskPrioritySchema)]).optional(),
  type: z.union([taskTypeSchema, z.array(taskTypeSchema)]).optional(),
  departmentId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  creatorId: z.string().uuid().optional(),
  watcherId: z.string().uuid().optional(),
  deadlineFrom: z.coerce.date().optional(),
  deadlineTo: z.coerce.date().optional(),
  isOverdue: z.boolean().optional(),
  isAutoCreated: z.boolean().optional(),
});

export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;

// ============================================================================
// FILTER PRESETS
// ============================================================================

export const createFilterPresetSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(50),
  filters: taskFiltersSchema,
});

export const updateFilterPresetSchema = z.object({
  presetId: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  filters: taskFiltersSchema.optional(),
});

export const deleteFilterPresetSchema = z.object({
  presetId: z.string().uuid(),
});

// ============================================================================
// CHANGE STATUS (с проверкой зависимостей)
// ============================================================================

export const changeTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  newStatus: taskStatusSchema,
  force: z.boolean().default(false), // Принудительно, игнорируя зависимости (только для админов)
});

export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;

export interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: "new" | "in_progress" | "review" | "done" | "archived";
    priority: "low" | "normal" | "high";
    assignedToUserId?: string | null;
    assignedToRoleId?: string | null;
    assignedToDepartmentId?: string | null;
    dueDate?: Date | string | null;
    createdAt: Date | string;
    type: "design" | "production" | "acquisition" | "delivery" | "other";
    orderId?: string | null;
    order?: {
        id: string;
        orderNumber: string;
        client?: { name: string | null } | null
    } | null;
    checklists?: {
        id: string;
        content: string;
        isCompleted: boolean;
        sortOrder: number;
    }[];
    comments?: {
        id: string;
        content: string;
        createdAt: Date | string;
        user: { name: string, avatar?: string | null };
    }[];
    attachments?: {
        id: string;
        fileName: string;
        fileUrl: string;
        fileSize?: number | null;
        contentType?: string | null;
    }[];
    history?: {
        id: string;
        type: string;
        oldValue?: string | null;
        newValue?: string | null;
        createdAt: Date | string;
        user: { name: string };
    }[];
    creator?: { name: string } | null;
    assignedToUser?: { name: string, avatar?: string | null } | null;
    assignedToDepartment?: { name: string } | null;
    assignedToRole?: { name: string } | null;
}

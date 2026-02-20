export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    socialMax?: string | null;
    department?: { name: string } | null;
    role?: { name: string } | null;
    birthday?: string | null;
    createdAt: string | Date;
}

export interface ActivityItem {
    id: number;
    type: string;
    text: string;
    time: string;
    iconName: string;
    color: string;
}

export interface Task {
    id: number;
    text: string;
    time: string;
    priority: string;
    priorityColor: string;
    completed: boolean;
}

export interface StatisticsData {
    totalOrders: number;
    totalRevenue: number;
    monthlyOrders: number;
    tasksByStatus: Array<{ count: number; status: string }>;
    totalActivity: number;
    efficiency: number;
}

export interface ScheduleTask {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    assignedToUserId: string | null;
    createdAt: Date;
    updatedAt?: Date;
}

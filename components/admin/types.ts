export interface StatsData {
    server: {
        cpuLoad: number[];
        totalMem: number;
        freeMem: number;
        uptime: number;
        platform: string;
        arch: string;
        disk?: { total: number; free: number };
    };
    database: {
        size: number;
        tableCounts: Record<string, string | number>;
    };
    storage: {
        size: number;
        fileCount: number;
    };
}

export interface HealthData {
    database: { status: string; latency: number };
    storage: { status: string };
    api: { status: string; latency: number };
    overall: string;
    env: { status: string; details: string[] };
    fs: { status: string; message: string };
    backup: { status: string; lastBackup: string | null };
    jwt: { status: string; message: string };
    timestamp: Date;
}

export interface BackupFile {
    name: string;
    size: number;
    createdAt: string;
}

export interface MonitoringData {
    activeUsers: Array<{
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        role?: string;
        department?: string;
        lastActiveAt: Date | null;
    }>;
    activityStats: { hour: number; type: string; count: number }[];
    entityStats: { type: string; count: number }[];
    performance: number;
}

export interface FailedLogin {
    id: string;
    email: string;
    reason: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
}

export interface SystemError {
    id: string;
    message: string;
    path?: string | null;
    method?: string | null;
    severity?: string;
    ipAddress?: string | null;
    createdAt: Date;
}

export interface SecurityData {
    failedLogins: FailedLogin[];
    sensitiveActions: Array<{
        id: string;
        user: string;
        action: string;
        details: Record<string, unknown> | null;
        createdAt: Date;
    }>;
    systemErrors: SystemError[];
    maintenanceMode: boolean;
}

export interface StorageFile {
    key: string;
    size: number;
    lastModified: Date | string | undefined;
}

export interface StorageData {
    s3: {
        size: number;
        fileCount: number;
        folders: string[];
        files: StorageFile[];
    };
    local: {
        total: number;
        free: number;
        used: number;
        path: string;
    };
}

// Типы для модуля контроля присутствия

export interface XiaomiAccount {
    id: string;
    xiaomiUserId: string;
    email: string | null;
    nickname: string | null;
    region: string;
    isActive: boolean;
    lastSyncAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Camera {
    id: string;
    xiaomiAccountId: string | null;
    deviceId: string;
    model: string | null;
    name: string;
    localName: string | null;
    location: string | null;
    localIp: string | null;
    streamUrl: string | null;
    status: "online" | "offline" | "error" | "connecting";
    lastOnlineAt: Date | null;
    errorMessage: string | null;
    isEnabled: boolean;
    confidenceThreshold: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CameraWithAccount extends Camera {
    xiaomiAccount: XiaomiAccount | null;
}

export interface EmployeeFace {
    id: string;
    userId: string;
    faceEncoding: number[];
    photoUrl: string | null;
    isActive: boolean;
    isPrimary: boolean;
    quality: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PresenceLog {
    id: string;
    userId: string | null;
    cameraId: string | null;
    eventType: "detected" | "lost" | "recognized" | "unknown";
    confidence: string | null;
    faceEncoding: number[] | null;
    snapshotUrl: string | null;
    timestamp: Date;
}

export interface WorkSession {
    id: string;
    userId: string;
    cameraId: string | null;
    date: Date;
    startTime: Date;
    endTime: Date | null;
    durationSeconds: number;
    sessionType: "work" | "break" | "idle";
    createdAt: Date;
}

export interface DailyWorkStats {
    id: string;
    userId: string;
    date: Date;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
    workSeconds: number;
    idleSeconds: number;
    breakSeconds: number;
    productivity: string | null;
    totalSessions: number;
    lateArrivalMinutes: number;
    earlyDepartureMinutes: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PresenceSetting {
    id: string;
    key: string;
    value: unknown;
    description: string | null;
    updatedAt: Date;
}

// Типы для отчётов
export interface EmployeePresenceStatus {
    userId: string;
    userName: string;
    userAvatar: string | null;
    departmentName: string | null;
    status: "working" | "idle" | "away" | "offline";
    lastSeenAt: Date | null;
    cameraName: string | null;
    todayWorkSeconds: number;
    todayIdleSeconds: number;
}

export interface DailyReportRow {
    userId: string;
    userName: string;
    userAvatar: string | null;
    departmentName: string | null;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
    workHours: number;
    idleHours: number;
    productivity: number;
    lateMinutes: number;
    earlyLeaveMinutes: number;
}

export interface WeeklyReportRow extends DailyReportRow {
    daysWorked: number;
    avgWorkHours: number;
    avgProductivity: number;
}

export interface MonthlyReportRow extends WeeklyReportRow {
    totalWorkHours: number;
    totalIdleHours: number;
}

// Типы для авторизации Xiaomi
export interface XiaomiLoginRequest {
    username: string;
    password: string;
    region: string;
}

export interface XiaomiLoginResponse {
    success: boolean;
    requireVerification?: boolean;
    verificationMethod?: "email" | "sms";
    maskedContact?: string;
    error?: string;
}

export interface XiaomiVerifyRequest {
    code: string;
    sessionId: string;
}

export interface XiaomiDevice {
    did: string;
    model: string;
    name: string;
    localIp: string | null;
    isOnline: boolean;
}

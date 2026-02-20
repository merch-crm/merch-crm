import { cn } from "@/lib/utils";

interface ProgressProps {
    value: number;
    max?: number;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "primary" | "success" | "warning" | "error";
    showValue?: boolean;
    animated?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
};

const variantClasses = {
    default: "bg-slate-600",
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
};

const variantBgClasses = {
    default: "bg-slate-200",
    primary: "bg-primary/20",
    success: "bg-emerald-100",
    warning: "bg-amber-100",
    error: "bg-rose-100",
};

function Progress({
    value,
    max = 100,
    size = "md",
    variant = "primary",
    showValue = false,
    animated = false,
    className,
}: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn("w-full", className)}>
            <div
                className={cn(
                    "w-full rounded-full overflow-hidden",
                    sizeClasses[size],
                    variantBgClasses[variant]
                )}
            >
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        variantClasses[variant],
                        animated && "animate-pulse"
                    )}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                />
            </div>
            {showValue && (
                <span className="text-xs font-medium text-slate-500 mt-1 block text-right">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
}

// Прогресс с меткой
interface ProgressWithLabelProps extends ProgressProps {
    label: string;
    description?: string;
}

function ProgressWithLabel({
    label,
    description,
    value,
    max = 100,
    ...props
}: ProgressWithLabelProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <span className="text-sm font-medium text-slate-500">{Math.round(percentage)}%</span>
            </div>
            <Progress value={value} max={max} {...props} />
            {description && (
                <p className="text-xs text-slate-500">{description}</p>
            )}
        </div>
    );
}

// Прогресс загрузки файла
interface FileUploadProgressProps {
    fileName: string;
    fileSize?: string;
    progress: number;
    status?: "uploading" | "success" | "error";
    onCancel?: () => void;
    onRetry?: () => void;
}

function FileUploadProgress({
    fileName,
    fileSize,
    progress,
    status = "uploading",
    onCancel,
    onRetry,
}: FileUploadProgressProps) {
    const variant = status === "error" ? "error" : status === "success" ? "success" : "primary";

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            status === "error" ? "bg-rose-100" : status === "success" ? "bg-emerald-100" : "bg-primary/10"
                        )}
                    >
                        {status === "error" ? (
                            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : status === "success" ? (
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{fileName}</p>
                        <p className="text-xs text-slate-500">
                            {status === "error" ? "Ошибка загрузки" : status === "success" ? "Загружено" : fileSize || "Загрузка..."}
                        </p>
                    </div>
                </div>
                {status === "uploading" && onCancel && (
                    <button type="button"
                        onClick={onCancel}
                        className="p-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
                {status === "error" && onRetry && (
                    <button type="button"
                        onClick={onRetry}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors shrink-0"
                    >
                        Повторить
                    </button>
                )}
            </div>
            {status === "uploading" && (
                <Progress value={progress} variant={variant} size="sm" />
            )}
        </div>
    );
}

// Шаги выполнения заказа
interface Step {
    id: string;
    label: string;
    description?: string;
}

interface StepsProgressProps {
    steps: Step[];
    currentStep: number;
    variant?: "default" | "primary";
    className?: string;
}

function StepsProgress({ steps, currentStep, variant = "primary", className }: StepsProgressProps) {
    return (
        <div className={cn("space-y-0", className)}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <div key={step.id} className="flex gap-4 relative">
                        {/* Линия соединения (вертикальный прогресс) */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "absolute left-4 top-8 w-0.5 h-[calc(100%-8px)] transition-colors",
                                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                                )}
                            />
                        )}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10",
                                    isCompleted
                                        ? "bg-emerald-500 text-white"
                                        : isCurrent
                                            ? variant === "primary"
                                                ? "bg-primary text-white"
                                                : "bg-slate-900 text-white"
                                            : "bg-slate-200 text-slate-500"
                                )}
                            >
                                {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                        </div>
                        <div className="pb-8 pt-1.5">
                            <p
                                className={cn(
                                    "text-sm font-bold leading-none",
                                    isCompleted || isCurrent ? "text-slate-900" : "text-slate-500"
                                )}
                            >
                                {step.label}
                            </p>
                            {step.description && (
                                <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Горизонтальные шаги (компактный вариант)
function StepsProgressHorizontal({ steps, currentStep, className }: StepsProgressProps) {
    return (
        <div className={cn("flex items-center w-full", className)}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <div key={step.id} className={cn("flex items-center", !isLast && "flex-1")}>
                        <div className="flex flex-col items-center relative">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10",
                                    isCompleted
                                        ? "bg-emerald-500 text-white"
                                        : isCurrent
                                            ? "bg-primary text-white"
                                            : "bg-slate-200 text-slate-500"
                                )}
                            >
                                {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <div className="absolute top-10 w-max text-center">
                                <span
                                    className={cn(
                                        "text-xs font-medium block whitespace-nowrap",
                                        isCompleted || isCurrent ? "text-slate-900" : "text-slate-500"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        </div>
                        {!isLast && (
                            <div
                                className={cn(
                                    "h-0.5 flex-1 mx-2 transition-colors",
                                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export {
    Progress,
    ProgressWithLabel,
    FileUploadProgress,
    StepsProgress,
    StepsProgressHorizontal,
};

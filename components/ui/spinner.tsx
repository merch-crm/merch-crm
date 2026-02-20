import { cn } from "@/lib/utils";

// Базовый спиннер
interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "default" | "primary" | "white";
    className?: string;
}

const sizeClasses = {
    xs: "w-3 h-3 border-[1.5px]",
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
};

const variantClasses = {
    default: "border-slate-300 border-t-slate-600",
    primary: "border-primary/30 border-t-primary",
    white: "border-white/30 border-t-white",
};

function Spinner({ size = "sm", variant = "default", className }: SpinnerProps) {
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-solid",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            role="status"
            aria-label="Загрузка"
        />
    );
}

// Спиннер с текстом
interface SpinnerWithTextProps extends SpinnerProps {
    text?: string;
}

function SpinnerWithText({ text = "Загрузка...", size = "sm", variant = "default", className }: SpinnerWithTextProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Spinner size={size} variant={variant} />
            <span className="text-sm text-slate-500">{text}</span>
        </div>
    );
}

// Полноэкранный оверлей с загрузкой
interface LoadingOverlayProps {
    text?: string;
    blur?: boolean;
}

function LoadingOverlay({ text = "Загрузка...", blur = true }: LoadingOverlayProps) {
    return (
        <div
            className={cn(
                "absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80",
                blur && "backdrop-blur-sm"
            )}
        >
            <Spinner size="lg" variant="primary" />
            <span className="text-sm font-medium text-slate-600">{text}</span>
        </div>
    );
}

// Загрузка внутри карточки / блока
function LoadingBlock({ text, className }: { text?: string; className?: string }) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 gap-3", className)}>
            <Spinner size="md" variant="primary" />
            {text && <span className="text-sm text-slate-500">{text}</span>}
        </div>
    );
}

export { Spinner, SpinnerWithText, LoadingOverlay, LoadingBlock };

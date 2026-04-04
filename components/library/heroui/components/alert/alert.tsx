"use client";

import { createContext, useContext } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const alertVariants = tv({
  slots: {
    base: "flex w-full items-start gap-3 rounded-lg border p-4 text-sm",
    indicator: "mt-0.5 shrink-0",
    content: "flex flex-col gap-1",
    title: "font-semibold leading-none ",
    description: "text-muted-foreground",
  },
  variants: {
    status: {
      default: {
        base: "bg-background border-border text-foreground",
        indicator: "text-muted-foreground",
      },
      primary: {
        base: "bg-primary/5 border-primary/20 text-primary",
        indicator: "text-primary",
      },
      success: {
        base: "bg-success/5 border-success/20 text-success",
        indicator: "text-success",
      },
      warning: {
        base: "bg-warning/5 border-warning/20 text-warning",
        indicator: "text-warning",
      },
      danger: {
        base: "bg-danger/5 border-danger/20 text-danger",
        indicator: "text-danger",
      },
    },
  },
  defaultVariants: {
    status: "default",
  },
});

type AlertVariants = VariantProps<typeof alertVariants>;

interface AlertContextValue extends AlertVariants {
  slots: ReturnType<typeof alertVariants>;
}

const AlertContext = createContext<AlertContextValue | null>(null);

function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error("Alert components must be used within an Alert");
  return context;
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, AlertVariants {}

export function Alert({ status, className, ...props }: AlertProps) {
  const slots = alertVariants({ status });
  return (
    <AlertContext.Provider value={{ status, slots }}>
      <div
        role="alert"
        data-slot="heroui-alert"
        className={slots.base({ className })}
        {...props}
      />
    </AlertContext.Provider>
  );
}

export function AlertIndicator() {
  const { status, slots } = useAlert();
  const Icon = {
    default: Info,
    primary: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: XCircle,
  }[status || "default"];

  return <Icon className={slots.indicator()} size={18} />;
}

export function AlertContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { slots } = useAlert();
  return <div className={slots.content({ className })} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { slots } = useAlert();
  return <h5 className={slots.title({ className })} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { slots } = useAlert();
  return <div className={slots.description({ className })} {...props} />;
}

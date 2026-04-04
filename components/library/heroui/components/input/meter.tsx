"use client";

import { Meter as AriaMeter, type MeterProps as AriaMeterProps } from "react-aria-components";
import { tv } from "tailwind-variants";
import { Label } from "../label/label";
import { composeTailwindRenderProps } from "../../utils/compose";

const meter = tv({
  slots: {
    container: "flex flex-col gap-1.5 w-full max-w-sm",
    header: "flex items-center justify-between",
    track: "relative h-2 w-full rounded-full bg-secondary overflow-hidden",
    fill: "h-full transition-all duration-500",
  },
  variants: {
    status: {
      low: { fill: "bg-danger" },
      medium: { fill: "bg-warning" },
      high: { fill: "bg-success" },
    },
  },
  defaultVariants: {
    status: "high",
  },
});

export interface MeterProps extends AriaMeterProps {
  label?: string;
  showValue?: boolean;
}

export function Meter({ label, showValue, className, ...props }: MeterProps) {
  const slots = meter();
  const percentage = props.value !== undefined ? (props.value / (props.maxValue || 100)) * 100 : 0;
  
  // Simple heuristic for status
  const status = percentage < 30 ? "low" : percentage < 70 ? "medium" : "high";

  return (
    <AriaMeter
      data-slot="heroui-meter"
      className={composeTailwindRenderProps(className, slots.container())}
      {...props}
    >
      {({ valueText }) => (
        <>
          <div className={slots.header()}>
            {label && <Label>{label}</Label>}
            {showValue && <span className="text-sm font-medium text-muted-foreground">{valueText}</span>}
          </div>
          <div className={slots.track()}>
            <div className={slots.fill({ status })} style={{ width: `${percentage}%` }} />
          </div>
        </>
      )}
    </AriaMeter>
  );
}

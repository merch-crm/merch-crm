"use client";

import { ProgressBar as AriaProgressBar, type ProgressBarProps as AriaProgressBarProps } from "react-aria-components";
import { tv } from "tailwind-variants";
import { Label } from "../label/label";
import { composeTailwindRenderProps } from "../../utils/compose";

const progressCircle = tv({
  slots: {
    container: "flex flex-col items-center gap-1.5",
    svg: "h-20 w-20 -rotate-90",
    track: "stroke-secondary fill-none",
    fill: "stroke-primary fill-none transition-all duration-500",
  },
});

export interface ProgressCircleProps extends AriaProgressBarProps {
  label?: string;
  size?: number;
  showValue?: boolean;
}

export function ProgressCircle({ label, size = 80, showValue, className, ...props }: ProgressCircleProps) {
  const slots = progressCircle();
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const percentage = props.value !== undefined ? (props.value / (props.maxValue || 100)) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <AriaProgressBar
      data-slot="heroui-progress-circle"
      className={composeTailwindRenderProps(className, slots.container())}
      {...props}
    >
      {({ valueText }) => (
        <>
          <svg className={slots.svg()} viewBox="0 0 80 80" width={size} height={size}>
            <circle
              className={slots.track()}
              cx="40"
              cy="40"
              r={radius}
              strokeWidth="6"
            />
            <circle
              className={slots.fill()}
              cx="40"
              cy="40"
              r={radius}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          {label && <Label>{label}</Label>}
          {showValue && <span className="text-xs font-medium text-muted-foreground">{valueText}</span>}
        </>
      )}
    </AriaProgressBar>
  );
}

"use client";

import {
  Slider as AriaSlider,
  SliderTrack as AriaSliderTrack,
  SliderThumb as AriaSliderThumb,
  type SliderProps as AriaSliderProps,
  SliderOutput,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Label } from "../label/label";

import { composeTailwindRenderProps } from "../../utils/compose";

const slider = tv({
  slots: {
    container: "flex flex-col gap-1.5 w-full max-w-sm",
    header: "flex items-center justify-between",
    track: "relative h-2 w-full grow rounded-full bg-secondary",
    filler: "absolute h-full rounded-full bg-primary",
    thumb: "h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 data-[dragging]:scale-110 transition-transform",
  },
});

export interface SliderProps extends AriaSliderProps {
  label?: string;
  showValue?: boolean;
}

export function Slider({ label, showValue, className, ...props }: SliderProps) {
  const slots = slider();
  return (
    <AriaSlider
      data-slot="heroui-slider"
      className={composeTailwindRenderProps(className, slots.container())}
      {...props}
    >
      <div className={slots.header()}>
        {label && <Label>{label}</Label>}
        {showValue && <SliderOutput className="text-sm font-medium text-muted-foreground" />}
      </div>
      <AriaSliderTrack className={slots.track()}>
        {({ state }) => (
          <>
            <div className={slots.filler()} style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
            <AriaSliderThumb className={slots.thumb()} />
          </>
        )}
      </AriaSliderTrack>
    </AriaSlider>
  );
}

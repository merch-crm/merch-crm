"use client";

import * as React from "react";
import {
  ColorArea,
  ColorAreaProps,
  ColorField,
  ColorFieldProps,
  ColorPicker as AriaColorPicker,
  ColorSlider,
  ColorSliderProps,
  ColorSwatch,
  ColorSwatchProps,
  ColorThumb,
  SliderTrack,
} from "react-aria-components";
import { cn } from "@/lib/utils";

/**
 * Root component for the ColorPicker.
 */
const Root = AriaColorPicker;

/**
 * Control wrapper (UI sugar).
 */
const Control = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-3", className)} {...props} />
);

/**
 * The interactive area for selecting color (saturation/brightness).
 */
const Area = ({ className, ...props }: ColorAreaProps) => (
  <ColorArea
    className={cn(
      "relative h-[192px] w-full cursor-crosshair rounded-xl",
      className
    )}
    {...props}
  >
    <ColorThumb className="z-10 h-5 w-5 rounded-full border-2 border-white bg-transparent shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none" />
  </ColorArea>
);

/**
 * A slider for specific color channels (Hue, Alpha, etc.).
 */
const Slider = ({ className, ...props }: ColorSliderProps) => (
  <ColorSlider
    className={cn("flex flex-col gap-2", className)}
    {...props}
  >
    <SliderTrack className="relative h-3 w-full rounded-full border border-black/5">
      <ColorThumb className="z-10 h-5 w-5 rounded-full border-2 border-white bg-transparent shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none" />
    </SliderTrack>
  </ColorSlider>
);

/**
 * The thumb (used inside Area or Slider if needed separately).
 */
const SliderThumb = ColorThumb;

/**
 * Input field for Hex/RGBA values.
 */
const Input = ({ className, ...props }: ColorFieldProps) => (
  <ColorField {...props}>
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
    />
  </ColorField>
);

/**
 * A color swatch (preset).
 */
const Swatch = ({ className, color, ...props }: ColorSwatchProps) => (
  <ColorSwatch
    className={cn(
      "h-8 w-8 rounded-lg border border-black/5 transition-transform hover:scale-110 active:scale-95 cursor-pointer",
      className
    )}
    color={color}
    {...props}
  />
);

/**
 * Eye dropper button placeholder.
 */
const EyeDropperButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors",
        props.className
      )}
      {...props}
    />
  );
});
EyeDropperButton.displayName = "EyeDropperButton";

/**
 * Compatibility component for older usage.
 */
interface ColorPickerCompatProps {
  value?: string;
  color?: string;
  onChange?: (value: string) => void;
  label?: string;
  className?: string;
  isInline?: boolean;
}

const ColorPicker = ({ value, color, onChange, label, className }: ColorPickerCompatProps) => {
  const actualValue = value || color || "";
  return (
    <Root value={actualValue} onChange={(newColor) => onChange?.(newColor.toString())}>
      <div className="space-y-2">
        {label && <label className="text-sm font-bold text-slate-700 ml-1 block">{label}</label>}
        <Control className={cn("flex flex-row items-center gap-2", className)}>
          <Swatch color={actualValue} />
          <Input />
        </Control>
      </div>
    </Root>
  );
};

export {
  Root,
  Control,
  Area,
  Slider,
  SliderThumb,
  Input,
  Swatch,
  EyeDropperButton,
  ColorPicker,
};

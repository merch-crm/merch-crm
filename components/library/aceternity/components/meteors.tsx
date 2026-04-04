import { cn } from "../utils/cn";
import React from "react";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const [items, setItems] = React.useState<{ top: number; left: string; animationDelay: string; animationDuration: string }[]>([]);
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    const newItems = Array.from({ length: number || 20 }).map(() => ({
      top: 0,
      // audit-ok: hydration
      left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
      // audit-ok: hydration
      animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
      // audit-ok: hydration
      animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
    }));
    setItems(newItems);
  }, [number]);

  if (!isMounted || !items) return null;

  return (
    <>
      {items?.map((item, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
            className
          )}
          style={{
            top: item.top,
            left: item.left,
            animationDelay: item.animationDelay,
            animationDuration: item.animationDuration,
          }}
        />
      ))}
    </>
  );
};

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { Button } from "./button";
import { ChevronRight, Users } from "lucide-react";
import { BentoCard } from "@/components/library/custom/ui/bento-primitives";

export interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  subtitle: string;
  avatarSrc?: string;
  avatarFallback?: React.ReactNode;
  onActionClick?: () => void;
}

const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ className, name, subtitle, avatarSrc, avatarFallback, onActionClick, ...props }, ref) => {
    return (
      <BentoCard
        ref={ref}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActionClick?.();
          }
        }}
        className={cn(
          "w-full max-w-md p-5 flex-row items-center gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10",
          className
        )}
        onClick={onActionClick}
        {...props}
      >
        <div className="relative shrink-0">
          <Avatar shape="square" size="lg" className="rounded-2xl border border-slate-200 shadow-none bg-slate-100 text-slate-400 size-14">
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback className="bg-transparent">
              {avatarFallback || <Users className="size-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl pointer-events-none" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-black text-slate-900 truncate">{name}</h4>
          <p className="text-xs text-slate-500 font-medium truncate">{subtitle}</p>
        </div>
        <Button color="gray" variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform shrink-0">
          <ChevronRight className="size-5" />
        </Button>
      </BentoCard>
    );
  }
);
ProfileCard.displayName = "ProfileCard";

export { ProfileCard };

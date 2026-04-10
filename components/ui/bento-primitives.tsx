import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoProps {
  children?: React.ReactNode;
  className?: string;
  icon?: LucideIcon | React.ReactNode;
  wrapperClassName?: string;
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const BentoCard = ({ children, className }: BentoProps) => (
  <div className={cn("bg-white rounded-card border border-gray-100 p-4 relative overflow-hidden h-full flex flex-col", className)}>
    {children}
  </div>
);

export const BentoIconContainer = ({ children, className }: BentoProps) => (
  <div className={cn("size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500", className)}>
    {children}
  </div>
);

export const BentoHeader = ({ title, subtitle, icon, rightElement, className }: BentoProps) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-3 text-left">
        {icon && (
          <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
            {typeof icon === 'function' ? React.createElement(icon as LucideIcon, { className: "size-5" }) : icon}
          </div>
        )}
        <div className="flex flex-col">
          {title && <h3 className="text-sm font-bold text-gray-900 leading-none">{title}</h3>}
          {subtitle && <p className="text-[11px] font-black text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {rightElement}
    </div>
  );
};

export const BentoInput = ({ icon: iconProp, wrapperClassName, ...props }: BentoProps & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className={cn("relative", wrapperClassName)}>
    {iconProp && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400">
        {typeof iconProp === 'function' ? React.createElement(iconProp as LucideIcon, { className: "size-4" }) : iconProp}
      </div>
    )}
    <input 
      className={cn(
        "w-full h-9 bg-gray-50 border border-gray-100 rounded-xl px-3 text-[11px] font-bold focus:outline-none focus:border-primary-base transition-all",
        iconProp && "pl-9"
      )} 
      {...props} 
    />
  </div>
);

export const BentoFormField = ({ children, className }: BentoProps) => (
  <div className={cn("space-y-1.5", className)}>{children}</div>
);

export const inputStyles = "w-full h-9 bg-gray-50 border border-gray-100 rounded-xl px-3 text-[11px] font-bold focus:outline-none focus:border-primary-base transition-all";
export const textAreaStyles = "w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[11px] font-bold focus:outline-none focus:border-primary-base transition-all min-h-[80px] resize-none";

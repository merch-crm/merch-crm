import Link from "next/link";
import { cn } from "@/components/library/custom/utils/cn";
import { LucideIcon, ChevronRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  href: string;
  icon: LucideIcon;
  count: number;
  description: string;
  sources: string[];
  className?: string;
}

export function CategoryCard({
  name,
  href,
  icon: Icon,
  count,
  description,
  sources,
  className,
}: CategoryCardProps) {
  return (
    <Link href={href} className={cn( "crm-card group flex flex-col justify-between transition-all hover:shadow-[var(--shadow-crm-lg)] hover:-translate-y-0.5", className )}>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-inner)] bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {count}
          </span>
        </div>
        <h3 className="mb-1 text-base font-bold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {sources.map((s) => (
            <span
              key={s}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

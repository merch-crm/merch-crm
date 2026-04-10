import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrossLinkCardProps {
    href: string;
    title: string;
    description?: string;
    icon: LucideIcon;
    badge?: string;
    stats?: Array<{
        label: string;
        value: string | number;
    }>;
    className?: string;
}

export function CrossLinkCard({
    href,
    title,
    description,
    icon: Icon,
    badge,
    stats,
    className,
}: CrossLinkCardProps) {
    return (
        <Link href={href}>
            <Card className={cn( "hover:shadow-md transition-all hover:border-primary/50 group", className )}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium group-hover:text-primary transition-colors">
                                    {title}
                                </h4>
                                {badge && (
                                    <Badge className="text-xs" color="neutral">
                                        {badge}
                                    </Badge>
                                )}
                            </div>

                            {description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {description}
                                </p>
                            )}

                            {stats && stats.length > 0 && (
                                <div className="flex gap-3 mt-2">
                                    {stats.map((stat, index) => (
                                        <div key={index} className="text-xs">
                                            <span className="font-medium">{stat.value}</span>
                                            <span className="text-muted-foreground ml-1">
                                                {stat.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

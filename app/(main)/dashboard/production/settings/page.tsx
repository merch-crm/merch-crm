import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Настройки | Производство",
  description: "Настройки раздела производства",
};

const settingsItems = [
  {
    title: "Типы нанесения",
    description: "Управление типами нанесения (DTF, вышивка, сублимация и др.)",
    icon: Layers,
    href: "/dashboard/production/settings/application-types",
    color: "bg-blue-500/10 text-blue-500",
  },
  // Можно добавить другие настройки в будущем
];

export default function ProductionSettingsPage() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/production">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold ">Настройки производства</h1>
          <p className="text-muted-foreground">
            Конфигурация раздела производства
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-3">
        {settingsItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="rounded-2xl border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

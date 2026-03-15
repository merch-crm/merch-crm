// app/(main)/dashboard/production/calculators/page.tsx
import Link from "next/link";
import { 
  Layers, 
  Droplets, 
  Shirt, 
  Grid3X3, 
  Scissors, 
  Stamp,
  ArrowRight,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalculatorCardData {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
  shadowColor: string;
}

const calculators: CalculatorCardData[] = [
  {
    id: "dtf",
    name: "DTF-печать",
    description: "Прямая печать на плёнку с переносом на ткань",
    href: "/dashboard/production/calculators/dtf",
    icon: Layers,
    gradient: "from-blue-500 via-blue-600 to-indigo-600",
    shadowColor: "shadow-blue-500/30",
  },
  {
    id: "sublimation",
    name: "Сублимация",
    description: "Перенос красителя в структуру ткани",
    href: "/dashboard/production/calculators/sublimation",
    icon: Droplets,
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    shadowColor: "shadow-teal-500/30",
  },
  {
    id: "dtg",
    name: "DTG-печать",
    description: "Прямая цифровая печать на текстиль",
    href: "/dashboard/production/calculators/dtg",
    icon: Shirt,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    shadowColor: "shadow-purple-500/30",
  },
  {
    id: "silkscreen",
    name: "Шелкография",
    description: "Трафаретная печать через сетку",
    href: "/dashboard/production/calculators/silkscreen",
    icon: Grid3X3,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    shadowColor: "shadow-orange-500/30",
  },
  {
    id: "embroidery",
    name: "Вышивка",
    description: "Машинная вышивка нитками на ткани",
    href: "/dashboard/production/calculators/embroidery",
    icon: Scissors,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    shadowColor: "shadow-pink-500/30",
  },
  {
    id: "print-application",
    name: "Нанесение принта",
    description: "Термотрансферы, нашивки, шевроны",
    href: "/dashboard/production/calculators/print-application",
    icon: Stamp,
    gradient: "from-slate-600 via-slate-700 to-slate-800",
    shadowColor: "shadow-slate-500/30",
  },
];

export default function CalculatorsOverviewPage() {
  return (
    <div className="space-y-3">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Калькуляторы нанесения</h1>
          <p className="text-sm font-medium text-slate-500">
            Выберите тип нанесения для расчёта стоимости
          </p>
        </div>
      </div>

      {/* Сетка калькуляторов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {calculators.map((calc) => (
          <CalculatorCard key={calc.id} calculator={calc} />
        ))}
      </div>
    </div>
  );
}

interface CalculatorCardProps {
  calculator: CalculatorCardData;
}

function CalculatorCard({ calculator }: CalculatorCardProps) {
  const Icon = calculator.icon;

  return (
    <Link
      href={calculator.href}
      className={cn(
        "crm-card group relative overflow-hidden",
        "hover:shadow-xl transition-all duration-300",
        "hover:-translate-y-1",
        calculator.shadowColor
      )}
    >
      {/* Градиентный фон (появляется при ховере) */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        calculator.gradient
      )} />

      {/* Декоративный элемент */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Контент */}
      <div className="relative z-10">
        {/* Иконка */}
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300",
          "bg-slate-100 text-slate-600",
          "group-hover:bg-white/20 group-hover:text-white"
        )}>
          <Icon className="w-7 h-7" />
        </div>

        {/* Текст */}
        <h3 className={cn(
          "text-lg font-bold mb-1 transition-colors duration-300",
          "text-slate-900 group-hover:text-white"
        )}>
          {calculator.name}
        </h3>
        <p className={cn(
          "text-sm font-medium transition-colors duration-300",
          "text-slate-500 group-hover:text-white/80"
        )}>
          {calculator.description}
        </p>

        {/* Стрелка */}
        <div className={cn(
          "absolute bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          "bg-slate-100 text-slate-400",
          "group-hover:bg-white/20 group-hover:text-white",
          "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
        )}>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

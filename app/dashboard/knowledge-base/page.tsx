import { Search, Book, FileText, HelpCircle, ChevronRight, ShoppingCart as ShoppingCartIcon, Palette as PaletteIcon, Settings as SettingsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const categories = [
    {
        title: "Частые вопросы",
        description: "Ответы на самые популярные вопросы о работе в MerchCRM",
        icon: HelpCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        count: 12
    },
    {
        title: "Работа с заказами",
        description: "Инструкции по созданию, обработке и управлению заказами",
        icon: ShoppingCartIcon,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        count: 8
    },
    {
        title: "Дизайн",
        description: "Технические требования и процессы подготовки макетов",
        icon: PaletteIcon,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        count: 9
    },
    {
        title: "Производство",
        description: "Этапы изготовления, работа с оборудованием и персоналом",
        icon: SettingsIcon,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        count: 6
    }
];

export default async function KnowledgeBasePage() {
    const session = await getSession();
    if (!session) redirect("/login");

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-slate-900">База знаний</h1>
                <p className="text-slate-500 font-medium max-w-2xl">
                    Здесь собраны все необходимые инструкции, обучающие материалы и ответы на часто задаваемые вопросы для эффективной работы в системе.
                </p>
            </div>

            {/* Search Section */}
            <div className="relative max-w-2xl group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                    placeholder="Поиск по базе знаний..."
                    className="pl-14 h-16 text-lg rounded-[1.25rem] border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <Card key={category.title} className="group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 border-slate-200 cursor-pointer overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <div className={`w-14 h-14 rounded-2xl ${category.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner`}>
                                <category.icon className={`h-7 w-7 ${category.color}`} />
                            </div>
                            <CardTitle className="text-2xl font-black text-slate-900 mb-1">{category.title}</CardTitle>
                            <CardDescription className="line-clamp-2 font-medium text-slate-500 leading-relaxed">{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-50">
                                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{category.count} статей</span>
                                <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl">
                                    Открыть <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Popular Articles */}
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Популярные статьи</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[
                        "Как изменить статус производства?",
                        "Интеграция с мессенджерами для уведомлений",
                        "Экспорт финансовой отчетности в Excel",
                        "Управление ролями и правами доступа сотрудников"
                    ].map((article) => (
                        <div key={article} className="flex items-center p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                                <FileText className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                            </div>
                            <span className="flex-1 font-bold text-slate-700 group-hover:text-slate-900">{article}</span>
                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Support CTA */}
            <div className="p-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200 mt-12 group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30">
                                {session.name?.[0] || "U"}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black leading-tight">{session.name || "Пользователь"}</h2>
                                <p className="text-indigo-100 font-medium opacity-80">
                                    Нет необходимой информации? Уточни у руководителя отдела.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50 font-black px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-all text-lg">
                        Связаться с руководителем
                    </Button>
                </div>
                {/* Decorative elements */}
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                    <Book className="w-96 h-96" />
                </div>
                <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32" />
            </div>
        </div>
    );
}

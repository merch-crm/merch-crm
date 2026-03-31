

export default function DesignVariantsPage() {
    const variants = [
        { id: 1, title: "Classic Bento Grid", desc: "Симметричная сетка. Баланс данных." },
        { id: 2, title: "Dashboard Focus", desc: "Аналитический. Две колонки." },
        { id: 4, title: "Sidebar + Main", desc: "Фиксированный сайдбар. Операционный." },
        { id: 5, title: "Hero + Data Tiles", desc: "Hero-блок с фото. Премиальный." },
        { id: 6, title: "Premium Hybrid Dashboard", desc: "Hero-блок + Дашборд. Весь текущий функционал + премиум стиль (Темный)." },
        { id: 7, title: "Light Hybrid Edition", desc: "Светлый гибрид: Hero-блок, круглые графики, иконки транзакций." },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-foreground mb-2">Варианты дизайна страницы позиции</h1>
                <p className="text-muted-foreground mb-8">Выберите вариант для просмотра в полном размере (Russian UI)</p>

                <div className="grid grid-cols-2 gap-3">
                    {variants.map((v) => (
                        <a
                            key={v.id}
                            href={`/api/design-variants/variant-${v.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-6 bg-white rounded-3xl border border-border hover:border-foreground/20 transition-all hover:shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-lg">
                                    {v.id}
                                </div>
                                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{v.title}</h2>
                            </div>
                            <p className="text-sm text-muted-foreground">{v.desc}</p>
                            <div className="mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                Открыть оригинал ↗
                            </div>
                        </a>
                    ))}
                </div>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Все варианты полностью локализованы на русский язык.
                </div>
            </div>
        </div>
    );
}

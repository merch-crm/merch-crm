export const rfmSegments = [
    "champions",
    "loyal",
    "potential",
    "new",
    "promising",
    "need_attention",
    "about_to_sleep",
    "at_risk",
    "hibernating",
    "lost",
] as const;

export type RFMSegment = (typeof rfmSegments)[number];

export const rfmSegmentLabels: Record<string, string> = {
    champions: "Чемпионы",
    loyal: "Лояльные",
    potential: "Потенциальные",
    new: "Новые",
    promising: "Перспективные",
    need_attention: "Требуют внимания",
    about_to_sleep: "Засыпающие",
    at_risk: "В зоне риска",
    hibernating: "Спящие",
    lost: "Потерянные",
};

export const rfmSegmentColors: Record<string, string> = {
    champions: "#10B981",
    loyal: "#3B82F6",
    potential: "#8B5CF6",
    new: "#06B6D4",
    promising: "#6366F1",
    need_attention: "#F59E0B",
    about_to_sleep: "#F97316",
    at_risk: "#EF4444",
    hibernating: "#6B7280",
    lost: "#374151",
};

export const rfmSegmentDescriptions: Record<string, string> = {
    champions: "Недавно покупали, часто и много",
    loyal: "Покупают регулярно, хорошие суммы",
    potential: "Недавние клиенты с хорошим потенциалом",
    new: "Совсем недавно стали клиентами",
    promising: "Новые клиенты с небольшими покупками",
    need_attention: "Выше среднего, но давно не покупали",
    about_to_sleep: "Ниже среднего, рискуют уйти",
    at_risk: "Покупали много, но давно не появлялись",
    hibernating: "Последняя покупка очень давно",
    lost: "Не появлялись очень долго",
};

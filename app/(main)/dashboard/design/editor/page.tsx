import { Metadata } from "next";
import { EditorPageClient } from "./editor-page-client";

export const metadata: Metadata = {
    title: "Редактор макетов | Дизайн",
    description: "Графический редактор для создания макетов",
};

export default function EditorPage() {
    return <EditorPageClient />;
}

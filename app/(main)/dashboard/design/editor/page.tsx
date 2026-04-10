import { Metadata } from "next";
import { EditorLoader } from "./editor-loader";

export const metadata: Metadata = {
  title: "Редактор макетов | Дизайн",
  description: "Графический редактор для создания макетов",
};

export default function EditorPage() {
  return <EditorLoader />;
}


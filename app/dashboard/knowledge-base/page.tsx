import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWikiFolders, getWikiPages } from "./actions";
import { WikiClient } from "./wiki-client";

export default async function KnowledgeBasePage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const folders = await getWikiFolders();
    const pages = await getWikiPages();

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="sm:flex sm:items-end sm:justify-between px-1">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-normal  leading-none">База знаний</h1>
                    <p className="text-slate-400 text-xs font-bold  tracking-normal mt-3">Инструкции, процессы и ответы на вопросы</p>
                </div>
            </div>

            <WikiClient
                initialFolders={folders}
                initialPages={pages}
                userRole={session.roleName || "Пользователь"}
            />
        </div>
    );
}

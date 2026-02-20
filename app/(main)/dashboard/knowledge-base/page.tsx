import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWikiFolders, getWikiPages } from "./actions";
import { WikiClient } from "./wiki-client";

export default async function KnowledgeBasePage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const foldersRes = await getWikiFolders();
    const pagesRes = await getWikiPages();

    const folders = foldersRes.success ? foldersRes.data || [] : [];
    const pages = pagesRes.success ? pagesRes.data || [] : [];

    return (
        <div className="space-y-4 animate-in fade-in duration-700">
            <div className="sm:flex sm:items-end sm:justify-between px-1">
                <div>
                    <h1 data-testid="kb-title" className="text-4xl font-bold text-slate-900  leading-none">База знаний</h1>
                    <p className="text-slate-400 text-sm font-bold mt-3">Инструкции, процессы и ответы на вопросы</p>
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

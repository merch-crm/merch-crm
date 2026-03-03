import { getSession } from"@/lib/auth";
import { redirect } from"next/navigation";
import { getWikiFolders, getWikiPages } from"./actions";
import { WikiClient } from"./wiki-client";
import { PageHeader } from"@/components/layout/page-header";

export default async function KnowledgeBasePage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const foldersRes = await getWikiFolders();
    const pagesRes = await getWikiPages();

    const folders = foldersRes.success ? foldersRes.data || [] : [];
    const pages = pagesRes.success ? pagesRes.data || [] : [];

    return (
        <div className="space-y-3 animate-in fade-in duration-700">
            <PageHeader
                title="База знаний"
                description="Инструкции, процессы и ответы на вопросы"
                className="px-1"
            />

            <WikiClient
                initialFolders={folders}
                initialPages={pages}
                userRole={session.roleName ||"Пользователь"}
            />
        </div>
    );
}

import { getSession } from "@/lib/session";
import { redirect } from"next/navigation";
import { getKBFolders, getKBPages } from"./actions";
import { KBClient } from"./kb-client";
import { PageHeader } from"@/components/layout/page-header";

export default async function KnowledgeBasePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const foldersRes = await getKBFolders();
  const pagesRes = await getKBPages();

  const folders = foldersRes.success ? foldersRes.data || [] : [];
  const pages = pagesRes.success ? pagesRes.data || [] : [];

  return (
    <div className="space-y-3 animate-in fade-in duration-700">
      <PageHeader title="База знаний" description="Инструкции, процессы и ответы на вопросы" className="px-1" />

      <KBClient initialFolders={folders} initialPages={pages} userRole={session.roleSlug || "user"} />
    </div>
  );
}

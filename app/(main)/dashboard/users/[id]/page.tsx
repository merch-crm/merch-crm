import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema/users";
import { eq } from "drizzle-orm";
import { UserTasksSection } from "./components/user-tasks-section";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbLabelSync } from "@/components/layout/breadcrumb-label-sync";

interface UserPageProps {
 params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
 const session = await getSession();
 if (!session?.id) {
  redirect("/login");
 }

 const { id } = await params;

 const [user] = await db
  .select()
  .from(users)
  .where(eq(users.id, id))
  .limit(1);

 if (!user) {
  notFound();
 }

 const userName = user.name;

 return (
  <div className="p-6 lg:p-[--padding-xl] space-y-3">
   <BreadcrumbLabelSync id={id} label={userName} />
   <div className="flex flex-col gap-2">
    <h1 className="text-3xl font-black text-slate-900 ">
     Профиль сотрудника
    </h1>
    <p className="text-slate-500 font-medium">
     Аналитика задач и загруженность: <span className="text-slate-900 font-bold">{userName}</span>
    </p>
   </div>
   
   {/* Секция задач сотрудника */}
   <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-3xl" />}>
    <UserTasksSection userId={id} userName={userName} />
   </Suspense>
  </div>
 );
}

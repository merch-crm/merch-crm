import { getPromocodes } from "./actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PromocodesClient, Promocode } from "./promocodes-client";

export const dynamic = "force-dynamic";

export default async function PromocodesPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const res = await getPromocodes();

    return <PromocodesClient initialData={(res.data as unknown as Promocode[]) || []} />;
}

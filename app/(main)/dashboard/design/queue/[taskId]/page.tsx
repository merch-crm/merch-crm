import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDesignTask } from "../../actions/order-design-actions";
import { DesignTaskPageClient } from "./design-task-page-client";

interface PageProps {
    params: { taskId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const result = await getDesignTask(params.taskId);

    if (!result.success || !result.data) {
        return { title: "Задача не найдена" };
    }

    return {
        title: `${result.data.number} | Дизайн-задача`,
        description: result.data.title,
    };
}

export default async function DesignTaskPage({ params }: PageProps) {
    const result = await getDesignTask(params.taskId);

    if (!result.success || !result.data) {
        notFound();
    }

    return <DesignTaskPageClient task={result.data} />;
}

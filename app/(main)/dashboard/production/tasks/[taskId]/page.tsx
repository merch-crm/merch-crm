import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductionLine, ProductionStaff } from "@/lib/schema/production";
import { getProductionTask } from "../../actions/task-actions";
import { getProductionLines } from "../../actions/line-actions";
import { getProductionStaff } from "../../actions/staff-actions";
import { ProductionTaskPageClient } from "./production-task-page-client";

type PageProps = {
    params: Promise<{ taskId: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const result = await getProductionTask(params.taskId);
    if (!result.success || !result.data) {
        return { title: "Задача не найдена" };
    }
    return {
        title: `${result.data.title} | Производство`,
        description: result.data.description || "Детали производственной задачи",
    };
}

export default async function ProductionTaskPage(props: PageProps) {
    const params = await props.params;
    const [taskResult, linesResult, staffResult] = await Promise.all([
        getProductionTask(params.taskId),
        getProductionLines(),
        getProductionStaff(),
    ]);

    if (!taskResult.success || !taskResult.data) {
        notFound();
    }

    const lines = linesResult.success ? linesResult.data || [] : [];
    const staff = staffResult.success ? staffResult.data || [] : [];

    return (
        <div className="container py-6">
            <ProductionTaskPageClient
                task={taskResult.data!}
                lines={lines as ProductionLine[]}
                staff={staff as ProductionStaff[]}
            />
        </div>
    );
}

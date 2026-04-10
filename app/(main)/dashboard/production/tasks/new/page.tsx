import { Metadata } from "next";
import { getProductionLines } from "../../actions/line-actions";
import { getProductionStaff } from "../../actions/staff-actions";
import { getApplicationTypes } from "../../actions/application-type-actions";
import { NewTaskPageClient } from "./new-task-page-client";

export const metadata: Metadata = {
  title: "Новая задача | Производство",
  description: "Создание производственной задачи",
};

export default async function NewTaskPage() {
  const [linesResult, staffResult, typesResult] = await Promise.all([
    getProductionLines(),
    getProductionStaff(),
    getApplicationTypes(),
  ]);

  const lines = (linesResult.success && linesResult.data) ? linesResult.data : [];
  const staff = (staffResult.success && staffResult.data) ? staffResult.data : [];
  const applicationTypes = (typesResult.success && typesResult.data) ? typesResult.data : [];

  return (
    <NewTaskPageClient lines={lines} staff={staff} applicationTypes={applicationTypes} />
  );
}

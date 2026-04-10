import { Metadata } from "next";
import { getFeedbackByToken } from "./actions";
import { NPSClient } from "./nps-client";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const res = await getFeedbackByToken(token);
  
  if (!res.success) {
    return {
      title: "Отзыв не найден",
    };
  }

  const orderNumber = res.data?.orderNumber;
  return {
    title: orderNumber ? `Отзыв по заказу #${orderNumber}` : "Оставить отзыв",
    description: "Пожалуйста, оцените качество нашей работы",
  };
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  const res = await getFeedbackByToken(token);

  if (!res.success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-t-4 border-red-500">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Упс!</h1>
          <p className="text-slate-600 mb-6">{res.error}</p>
          <a href={`/nps/${token}`}>
            <Button variant="outline" className="w-full">Попробовать снова</Button>
          </a>
        </div>
      </div>
    );
  }

  if (!res.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-t-4 border-red-500 shadow-rose-100">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Упс!</h1>
          <p className="text-slate-600 mb-6">{res.error || "Данные не найдены"}</p>
          <a href={`/nps/${token}`}>
            <Button variant="outline" className="w-full">Обновить</Button>
          </a>
        </div>
      </div>
    );
  }

  return <NPSClient token={token} initialData={res.data} />;
}

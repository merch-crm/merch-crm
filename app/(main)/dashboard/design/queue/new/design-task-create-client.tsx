"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Palette, Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createDesignTask } from "../../actions/order-design-actions";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";


const formSchema = z.object({
  orderId: z.string().uuid("Выберите заказ из списка"),
  title: z.string().min(1, "Обязательное поле").max(255),
  description: z.string().optional().nullable(),
  applicationTypeId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1).optional(),
  priority: z.number().int().min(0).max(2).optional(),
});

interface Props {
  orders: { id: string; orderNumber: string | null; status: string }[];
  applicationTypes: { id: string; name: string }[];
}

export function DesignTaskCreateClient({ orders, applicationTypes }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setCustomTrail } = useBreadcrumbs();

  useEffect(() => {
    setCustomTrail([
      { label: "Дизайн", href: "/dashboard/design" },
      { label: "Очередь дизайна", href: "/dashboard/design/queue" },
      { label: "Новая задача", href: "" },
    ]);
    return () => setCustomTrail(null);
  }, [setCustomTrail]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
      title: "",
      description: "",
      priority: 0,
      quantity: 1,
      applicationTypeId: null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const res = await createDesignTask({ ...values });
      if (res?.success) {
        toast.success("Задача успешно создана");
        router.push("/dashboard/design/queue");
      } else {
        toast.error(res?.error || "Ошибка создания");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-3">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">Новая дизайн-задача</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Детали задачи</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="orderId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заказ *</FormLabel>
                    <Select value={field.value || ""} onChange={field.onChange} options={(orders || []).map(o => ({
                        id: o.id,
                        title: o.orderNumber || "Без номера"
                      }))}
                      placeholder="Выберите заказ..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название *</FormLabel>
                    <FormControl>
                      <Input placeholder="Например: Макет для худи с логотипом" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (ТЗ)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Подробное описание задачи, пожелания клиента..." className="min-h-[120px]" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="applicationTypeId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип нанесения</FormLabel>
                      <Select value={field.value || "none"} onChange={(val) => field.onChange(val === "none" ? null : val)}
                        options={[
                          { id: "none", title: "Не имеет значения" },
                          ...applicationTypes.map(t => ({
                            id: t.id,
                            title: t.name
                          }))
                        ]}
                        placeholder="Не имеет значения"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Приоритет</FormLabel>
                      <Select value={String(field.value)} onChange={(val) => field.onChange(Number(val))}
                        options={[
                          { id: "0", title: "Обычный" },
                          { id: "1", title: "Высокий" },
                          { id: "2", title: "Срочный" }
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Создать задачу
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/design/queue")}>
                  Отмена
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

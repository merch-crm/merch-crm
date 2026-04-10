"use client";

import { useState } from "react";
import { forgotPasswordAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { pluralize } from "@/lib/pluralize";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await forgotPasswordAction(email);

    setLoading(false);

    if (!result.success) {
      if (result.retryAfter) {
        setRetryAfter(result.retryAfter);
      }
      toast.error(result.error || "Ошибка при отправке. Попробуйте позже.");
      return;
    }

    setSent(true);
  }

  // ─── Экран: письмо отправлено ────────────────────────────────────
  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-background p-10 text-center shadow-sm max-w-sm w-full mx-4">
          <div className="text-5xl">📬</div>
          <h2 className="text-xl font-semibold">Письмо отправлено!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Если аккаунт с адресом <strong>{email}</strong> существует —
            вы получите письмо со ссылкой для сброса пароля.
          </p>
          <p className="text-xs text-muted-foreground">
            Не нашли письмо? Проверьте папку «Спам»
          </p>
          <a
            href="/login"
            className="mt-2 text-sm text-primary underline-offset-4 hover:underline"
          >
            &larr; Вернуться к входу
          </a>
        </div>
      </div>
    );
  }

  // ─── Экран: rate limit ───────────────────────────────────────────
  if (retryAfter) {
    const minutes = Math.ceil(retryAfter / 60);
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-background p-10 text-center shadow-sm max-w-sm w-full mx-4">
          <div className="text-5xl">⏳</div>
          <h2 className="text-xl font-semibold">Слишком много запросов</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Вы превысили лимит запросов на сброс пароля.
            <br />
            Повторите через{" "}
            <strong>
              {minutes} {pluralize(minutes, "минуту", "минуты", "минут")}
            </strong>
            .
          </p>
          <a
            href="/login"
            className="mt-2 text-sm text-primary underline-offset-4 hover:underline"
          >
            &larr; Вернуться к входу
          </a>
        </div>
      </div>
    );
  }

  // ─── Основная форма ───────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm mx-4">
        <div className="rounded-2xl border bg-background p-8 shadow-sm flex flex-col gap-3">
          <div className="text-center flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Забыли пароль?</h1>
            <p className="text-sm text-muted-foreground">
              Введите email — отправим ссылку для сброса
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="вы@компания.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Отправка..." : "Отправить ссылку"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            <a href="/login" className="text-primary underline-offset-4 hover:underline">
              &larr; Вернуться к входу
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

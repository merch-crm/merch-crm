/**
 * Публичный lightweight health endpoint для Docker healthcheck.
 * Не требует авторизации — проверяет только работоспособность процесса.
 * Для полной проверки с БД и Redis используйте /api/health (требует сессию).
 */
// audit-ignore
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        return new Response("ok", {
            status: 200,
            headers: {
                "Cache-Control": "no-store",
                "Content-Type": "text/plain",
            },
        });
    } catch (error) {
        console.error("Ping endpoint error:", error);
        return new Response("error", {
            status: 500,
            headers: {
                "Cache-Control": "no-store",
                "Content-Type": "text/plain",
            },
        });
    }
}

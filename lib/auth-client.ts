import { createAuthClient } from "better-auth/client";
import { twoFactorClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,

    // Глобальная обработка rate limit (429)
    fetchOptions: {
        onError: async (context) => {
            const { response } = context;

            if (response.status === 429) {
                const retryAfter = response.headers.get("X-Retry-After");
                const seconds = retryAfter ? parseInt(retryAfter) : 60;

                console.warn(`[Auth] Rate limit. Повтор через ${seconds}с`);

                window.dispatchEvent(
                    new CustomEvent("auth:rate-limit", {
                        detail: { retryAfter: seconds, minutes: Math.ceil(seconds / 60) },
                    })
                );
            }
        },
    },

    plugins: [
        twoFactorClient({
            onTwoFactorRedirect: () => {
                window.location.href = "/login/2fa";
            },
        }),
        adminClient(),
    ],
});

export const { signIn, signOut, useSession, twoFactor, admin } = authClient;

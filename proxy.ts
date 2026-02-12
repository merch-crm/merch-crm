import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Exclude static assets and API routes
    if (
        path.startsWith("/_next") ||
        path.startsWith("/api") ||
        path.startsWith("/static") ||
        path.includes(".") // Likely a file (image, css, etc.)
    ) {
        // NOTE: Глобальный Rate Limit для API лучше делать в самих роутах 
        // через lib/api-middleware, так как Redis (ioredis) не работает в Edge Runtime.
        return NextResponse.next();
    }

    // 2. Auth Check
    const sessionCookie = request.cookies.get("session")?.value;

    let session = null;
    if (sessionCookie) {
        try {
            session = await decrypt(sessionCookie);
        } catch {
            // Session invalid
        }
    }

    // 3. Redirect Logic

    // If user is logged in -> redirect away from login page
    if (session && path === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!session && path.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // RBAC: Protect Admin Routes
    if (session && path.startsWith("/admin-panel")) {
        if (session.roleName !== "Администратор") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // Root redirect: / -> /dashboard (which will then redirect to /login if needed)
    if (path === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// Ensure proxy runs on relevant paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

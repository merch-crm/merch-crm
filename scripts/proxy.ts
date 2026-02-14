import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Exclude static assets and system paths
    if (
        path.startsWith("/_next") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/cron") ||
        path.startsWith("/static") ||
        path === '/favicon.ico' ||
        path.includes(".") // Likely a file
    ) {
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

    // 3. Protection Logic
    const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/admin-panel');
    const isApiPath = path.startsWith('/api/') && !path.startsWith('/api/auth');

    if (!session && (isProtectedPath || isApiPath)) {
        if (isApiPath) {
            const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            response.cookies.delete('session');
            return response;
        }
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session');
        return response;
    }

    // If user is logged in -> redirect away from login page
    if (session && path === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
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
         * - api/auth (API auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
        '/api/:path*'
    ],
};

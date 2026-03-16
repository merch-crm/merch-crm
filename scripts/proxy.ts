import { NextResponse, type NextRequest } from "next/server";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
const PUBLIC_PATHS = [
    "/login",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/health",
];

// Paths that should be completely skipped by middleware logic
const SKIP_PATHS = [
    "/_next",
    "/favicon.ico",
    "/manifest.json",
    "/robots.txt",
    "/sitemap.xml",
    "/images", // assuming images folder in public
    "/public", // rarely used directly but good to have
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isSkipPath(pathname: string): boolean {
    return SKIP_PATHS.some((p) => pathname.startsWith(p));
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (pathname.includes("warehouse")) {
        console.log(`[DEBUG] Middleware START: ${req.method} ${pathname}`);
    }

    // --- 1. Basic CORS config for API ---
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const corsHeaders = new Headers();

    if (pathname.startsWith('/api')) {
        corsHeaders.set('Access-Control-Allow-Origin', allowedOrigin);
        corsHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        corsHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        corsHeaders.set('Access-Control-Allow-Credentials', 'true');

        if (req.method === "OPTIONS") {
            return new NextResponse(null, { status: 204, headers: corsHeaders });
        }
    }

    // --- 2. Skip static assets and internal Next.js paths ---
    if (isSkipPath(pathname)) {
        return NextResponse.next();
    }

    // --- 3. Check for Better Auth session ---
    if (pathname.includes("warehouse")) console.log(`[DEBUG] Middleware: Checking session...`);
    let isValid = false;

    try {
        if (pathname.includes("warehouse")) console.log(`[DEBUG] Middleware: Verifying Better Auth Session...`);
        const session = await auth.api.getSession({
            headers: await headers()
        });
        
        if (session && session.session) {
            isValid = true;
            if (pathname.includes("warehouse")) console.log(`[DEBUG] Middleware: Session Valid`);
        }
    } catch (error) {
        console.warn(`[Middleware] Session verification failed for ${pathname}:`, error instanceof Error ? error.message : error);
    }

    // --- 4. Handle Public Paths ---
    if (isPublicPath(pathname)) {
        if (pathname.includes("warehouse")) console.log(`[DEBUG] Middleware: Public path`);
        // If user is already authenticated and tries to access login, redirect to dashboard
        if (isValid && pathname === "/login") {
            const res = NextResponse.redirect(new URL("/dashboard", req.url)); // audit-ignore
            if (pathname.startsWith('/api')) {
                corsHeaders.forEach((val, key) => res.headers.set(key, val));
            }
            return res;
        }

        const res = NextResponse.next();
        if (pathname.startsWith('/api')) {
            corsHeaders.forEach((val, key) => res.headers.set(key, val));
        }
        return res;
    }

    // --- 5. Handle Protected Paths (everything else) ---
    if (!isValid) {
        if (pathname.includes("warehouse")) console.log(`[DEBUG] Middleware: Not valid, redirecting to login`);
        // For API routes, return 401 instead of redirect
        if (pathname.startsWith("/api/")) {
            const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            corsHeaders.forEach((val, key) => res.headers.set(key, val));
            return res;
        }

        // Redirect to login
        const loginUrl = new URL("/login", req.url);
        // Only add 'from' if it's not the root path to avoid ugly URLs for default entry
        if (pathname !== "/" && pathname.startsWith("/")) {
            loginUrl.searchParams.set("from", pathname);
        }
        return NextResponse.redirect(loginUrl); // audit-ignore
    }

    // --- 6. Authorized ---
    if (pathname.includes("warehouse")) console.log(`[DEBUG] Middleware: Authorized, next()`);
    const res = NextResponse.next();
    if (pathname.startsWith('/api')) {
        corsHeaders.forEach((val, key) => res.headers.set(key, val));
    }
    if (pathname.includes("warehouse")) console.log(`[DEBUG] Middleware: Returning next() res`);
    return res;
}

// Ensure we don't accidentally block static generation if we had a matcher
// validation logic above covers it manually now.
export const config = {
    matcher: '/:path*',
}

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

import { env } from "@/lib/env";

const SECRET_KEY = env.JWT_SECRET_KEY;
const key = new TextEncoder().encode(SECRET_KEY);

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

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Skip static assets and internal Next.js paths
    if (isSkipPath(pathname)) {
        return NextResponse.next();
    }

    // 2. Check for session cookie
    const token = req.cookies.get("session")?.value;

    // console.log(`[Middleware] Path: ${pathname}, Token present: ${!!token}`);

    let isValid = false;

    if (token && key) {
        try {
            await jwtVerify(token, key, { algorithms: ["HS256"] });
            isValid = true;
        } catch (error) {
            console.warn(`[Middleware] Token invalid for ${pathname}:`, error instanceof Error ? error.message : error);
        }
    } else if (token && !key) {
        console.error("[Middleware] SECRET_KEY is missing! Cannot verify token.");
    }

    // 3. Handle Public Paths
    if (isPublicPath(pathname)) {
        // If user is already authenticated and tries to access login, redirect to dashboard
        if (isValid && pathname === "/login") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.next();
    }

    // 4. Handle Protected Paths (everything else)
    if (!isValid) {
        // For API routes, return 401 instead of redirect
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Redirect to login
        const loginUrl = new URL("/login", req.url);
        // Only add 'from' if it's not the root path to avoid ugly URLs for default entry
        if (pathname !== "/") {
            loginUrl.searchParams.set("from", pathname);
        }
        return NextResponse.redirect(loginUrl);
    }

    // 5. Authorized
    return NextResponse.next();
}

// Ensure we don't accidentally block static generation if we had a matcher
// validation logic above covers it manually now.
export const config = {
    matcher: '/:path*',
}

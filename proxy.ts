import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const session = request.cookies.get("session")?.value;

    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // RBAC check
        try {
            const payload = await decrypt(session);
            if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
                if (payload.roleName !== "Администратор") {
                    return NextResponse.redirect(new URL("/dashboard", request.url));
                }
            }
        } catch {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    if (session && request.nextUrl.pathname.startsWith("/login")) {
        // Validate session
        try {
            await decrypt(session);
            return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch {
            // Session invalid, allow login
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

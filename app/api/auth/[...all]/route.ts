import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

// audit-ignore: Handled by better-auth internal session check
export async function GET(req: NextRequest) {
    try {
        const response = await handler.GET(req);
        return response as Response;
    } catch (error) {
        console.error("[AUTH_GET_ERROR]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

// audit-ignore: Handled by better-auth internal session check
export async function POST(req: NextRequest) {
    try {
        const response = await handler.POST(req);
        return response as Response;
    } catch (error) {
        console.error("[AUTH_POST_ERROR]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";


import { getSession } from "@/lib/auth";

export async function POST() {
    await getSession(); // Ensure session context is loaded/checked, though logout is idempotent

    try {
        (await cookies()).delete("session");
    } catch (error) {
        console.error("Logout error:", error);
    }
    redirect("/login");
}

export async function GET() {
    try {
        (await cookies()).delete("session");
    } catch (error) {
        console.error("Logout error:", error);
    }
    return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"), 302);
}

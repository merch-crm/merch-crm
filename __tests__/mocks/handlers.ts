/**
 * MSW handlers для мокирования API
 */

import { http, HttpResponse } from "msw";
import { createMockOrder, createMockClient, createMockSession } from "../test-utils";

export const handlers = [
  // Auth
  http.get("/api/auth/get-session", () => {
    return HttpResponse.json(createMockSession());
  }),

  // CSRF
  http.get("/api/csrf", () => {
    return HttpResponse.json({ token: "test-csrf-token" });
  }),

  // Orders
  http.get("/api/orders", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    return HttpResponse.json({
      orders: Array.from({ length: limit }, (_, i) =>
        createMockOrder({ id: `order-${page}-${i}`, orderNumber: `ORD-24-${String(i).padStart(4, "0")}` })
      ),
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: 5,
      },
    });
  }),

  http.get("/api/orders/:id", ({ params }) => {
    return HttpResponse.json(
      createMockOrder({ id: params.id as string })
    );
  }),

  // Clients
  http.get("/api/clients", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    return HttpResponse.json({
      clients: Array.from({ length: limit }, (_, i) =>
        createMockClient({ id: `client-${page}-${i}` })
      ),
      pagination: {
        page,
        limit,
        total: 50,
        totalPages: 3,
      },
    });
  }),

  // Upload
  http.post("/api/upload/init", async ({ request }) => {
    const body = await request.json() as { fileName: string; fileSize: number };
    return HttpResponse.json({
      uploadId: "test-upload-id",
      chunkSize: 5 * 1024 * 1024,
      totalChunks: Math.ceil(body.fileSize / (5 * 1024 * 1024)),
    });
  }),

  http.post("/api/upload/chunk", () => {
    return HttpResponse.json({
      received: 1,
      total: 1,
      complete: true,
    });
  }),

  http.post("/api/upload/complete", () => {
    return HttpResponse.json({
      success: true,
      file: {
        url: "https://example.com/uploads/test-file.pdf",
        key: "uploads/test-file.pdf",
        fileName: "test-file.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
      },
    });
  }),
];

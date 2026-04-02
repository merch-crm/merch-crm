import { getInventoryItem } from "../item-query-actions";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PrintLabelPageProps {
  searchParams: Promise<{
    id: string;
    q?: string;
    layout?: string;
    showArticle?: string;
    showCategory?: string;
    landscape?: string;
    width?: string;
    height?: string;
  }>;
}

export default async function PrintLabelPage({ searchParams }: PrintLabelPageProps) {
  const { id, q, showArticle, showCategory, landscape, width, height } = await searchParams;

  if (!id) notFound();

  const itemRes = await getInventoryItem(id);
  if ("error" in itemRes || !itemRes.data) notFound();

  const item = itemRes.data;
  const quantity = parseInt(q || "1") || 1;
  const isLandscape = landscape === "true";
  const paperWidth = width || "58mm";
  const paperHeight = height || "40mm";

  const headerList = await headers();
  const nonce = headerList.get("x-nonce") || "";

  const currentDate = new Date().toLocaleDateString("ru-RU"); // suppressHydrationWarning: Server Component — safe for SSR

  // QR Code URL (static generated)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    item.sku || item.id
  )}`;

  return (
    <html>
      <head>
        <title>Печать этикеток - {item.name}</title>
        <style nonce={nonce}>
          {`
            @page {
              size: ${isLandscape ? `${paperHeight} ${paperWidth}` : `${paperWidth} ${paperHeight}`};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: white;
            }
            .label-page {
              width: 100%;
              display: flex;
              flex-direction: column;
            }
            .label-container {
              width: ${isLandscape ? paperHeight : paperWidth};
              height: ${isLandscape ? paperWidth : paperHeight};
              page-break-after: always;
              padding: 4mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              border: 1px dotted #eee;
              position: relative;
              overflow: hidden;
            }
            @media print {
              .label-container {
                border: none;
              }
            }
            .header {
              font-size: 8pt;
              font-weight: 900;
              margin-bottom: 2mm;
              line-height: 1.1;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .content {
              display: flex;
              flex: 1;
              gap: 2mm;
            }
            .qr {
              width: 18mm;
              height: 18mm;
            }
            .info {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .sku {
              font-size: 7pt;
              font-weight: 700;
              margin-bottom: 1mm;
            }
            .category {
              font-size: 6pt;
              color: #666;
            }
            .footer {
              font-size: 5pt;
              color: #999;
              margin-top: auto;
              text-align: right;
            }
          `}
        </style>
      </head>
      <body>
        <div className="label-page">
          {Array.from({ length: quantity }).map((_, i) => (
            <div key={i} className="label-container">
              <div className="header">{item.name}</div>
              <div className="content">
                <Image src={qrUrl} className="qr" alt="QR" width={150} height={150} unoptimized />
                <div className="info">
                  {showArticle !== "false" && (
                    <div className="sku">SKU: {item.sku || "N/A"}</div>
                  )}
                  {showCategory !== "false" && (
                    <div className="category">
                      {item.category?.name || "Без категории"}
                    </div>
                  )}
                </div>
              </div>
              <div className="footer" suppressHydrationWarning>{currentDate}</div>
            </div>
          ))}
        </div>
        <script src="/scripts/auto-print.js" nonce={nonce} defer />
      </body>
    </html>
  );
}

# External Integrations Map

A strategic guide for connecting MerchCRM to the outside world.

## 🚚 Logistics (CDEK)
- **Use Case**: Auto-calculate shipping costs, generate labels, and track delivery status inside the Order card.
- **API Status**: Not started.
- **Key Fields**: `tracking_number`, `cdek_id`, `delivery_status`.

## 💬 Communication (WhatsApp & Telegram)
- **Use Case**: 
    - WhatsApp: Sending templates to clients (e.g., "Order is ready", "Invoice attached").
    - Telegram: Employee alerts (e.g., "New order assigned to you").
- **Providers**: 
    - WhatsApp: Meta Business API or Green-API/Twilio.
    - Telegram: Standard Bot API.

## 🤖 Production Bot (Telegram)
- **Use Case**: Mobile UI for workspace employees (Printers, Designers).
- **Features**:
    - Scan QR/Barcode on items to update status.
    - View individual daily task list.
    - Snap and upload "Work in Progress" photos to the CRM order card.

## 🛠️ Architecture Pattern
- All integration logic should reside in `@/lib/integrations/`.
- Use **Webhooks** for incoming status updates to avoid polling.
- Store API credentials ONLY in `.env.local`.

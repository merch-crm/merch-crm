# 🎵 Sound & Vibration Integration Rules

This document defines the mandatory standard for auditory and haptic feedback in MerchCRM. 
**Antigravity must follow these rules automatically when creating or modifying components.**

## 🛠 Core Implementation
- **Library**: `@/lib/sounds`
- **Main Function**: `playSound(type: SoundType)`
- **Vibration**: Managed automatically inside `playSound`. Patterns are tailored to the event type (Success = short bump, Error = double bump).

---

## 📋 Sound Mapping Rules

| Action Type | Recommended Sound | UI Trigger |
| :--- | :--- | :--- |
| **Success** | `notification_success` | Successful save, update, or generic positive result. |
| **Error / Failure** | `notification_error` | Server error, validation failure, or failed operation. |
| **Creation** | `notification_success` | Creating a new entity (task, promocode, category). |
| **Deletion / Remove** | `client_deleted` | Deleting an item, task, or record permanently. |
| **Order Success** | `order_created` | Successful checkout or new order creation. |
| **Financial Action** | `expense_added` | Creating an expense or recorded payment. |
| **Task Done** | `task_completed` | Marking a task as "Completed". |
| **Warehouse/Stock** | `stock_replenished`| Transferring stock between locations or restocking. |
| **Data Export** | `notification_success`| Successful CSV/XLSX generation and download. |
| **Scanning** | `scan_success` / `scan_error` | Result of a barcode or QR-code scan. |

---

## 🧩 Code Pattern
Always use this pattern in action handlers:

```tsx
import { playSound } from "@/lib/sounds";

async function handleAction() {
    const res = await serverAction(data);
    
    if (res.success) {
        toast("Done!", "success");
        playSound("notification_success"); // Match action type
    } else {
        toast(res.error, "error");
        playSound("notification_error");
    }
}
```

## 📜 Checklist for new Blocks/Pages:
1.  **Identify User Actions**: List all buttons that perform `POST`, `PATCH`, or `DELETE`.
2.  **Add playSound**: Ensure every `toast()` or `showModal("success" | "error", ...)` is accompanied by a `playSound` call.
3.  **Haptics**: No manual `navigator.vibrate` calls (except for special custom patterns). `playSound` handles the standard vibrations.
4.  **Bulk Actions**: For bulk operations, play the sound **once** after the entire operation completes, not for every single item.

---
*Reference this document to ensure MerchCRM feels "alive" and responsive.*

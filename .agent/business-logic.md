# Business Logic & Role Matrix

This document defines the core business rules and access control list (ACL) for the MerchCRM.

## User Roles
1.  **Администратор (Administrator)**
    *   **Scope**: Full control over all system modules.
    *   **Rights**: 
        *   User management (create/delete/roles).
        *   Audit log management.
        *   Warehouse destructive actions (Clear History, Delete records).
        *   Total stock adjustments.
2.  **Отдел продаж (Sales)**
    *   **Scope**: Order management and client interaction.
    *   **Rights**: (TBD - Create orders, view catalogue).
3.  **Производство / Печать / Вышивка (Production)**
    *   **Scope**: Task execution and material consumption.
    *   **Rights**: (TBD - Move inventory to production, update task status).

## Core Principles
1.  **Traceability**: No stock change should happen without an entry in `inventory_transactions`.
2.  **Immutability (Audit)**: The `audit_logs` table is the source of truth for administrative actions. Actions like "Clear Logs" or "Clear History" must themselves be logged.
3.  **Inventory Integrity**: Inventory is tracked both globally (`inventory_items.quantity`) and per location (`inventory_stocks`). Transfers MUST update stocks in both locations.

## Inventory Logic
- **"In" (Приход)**: Increases stock at a specific location and global balance.
- **"Out" (Расход)**: Decreases stock at a specific location and global balance.
- **"Transfer" (Перемещение)**: 
  - Moves quantity from `fromStorageLocationId` to `storageLocationId`.
  - Recorded as a single record in the History table for readability.
  - Decreases source stock, increases target stock.

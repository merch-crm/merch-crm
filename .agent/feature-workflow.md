# Feature Implementation Workflow

This document outlines the standard steps for implementing new features or modifying existing ones in MerchCRM.

## Step 1: Data Modeling
1.  **Modify `lib/schema.ts`**: Add tables, columns, or enums.
2.  **Apply Migrations**: Run `npm run db:push` to sync the database.
3.  **Update Relations**: Ensure the `relations()` block in `schema.ts` includes new linkages.

## Step 2: Server Actions
1.  **Define Action**: Locate or create `actions.ts` in the feature directory (e.g., `app/dashboard/warehouse/actions.ts`).
2.  **Auth & Roles**: Always check `getSession()` and `session.roleName` for sensitive actions.
3.  **Audit Logging**: Call `logAction` for any create/update/delete operation.
4.  **Revalidation**: Use `revalidatePath("/dashboard/...")` to clear server cache.

## Step 3: Frontend Component
1.  **Initialize Hook**: Use `useRouter()` and `useToast()`.
2.  **Form Validation**:
    *   Use local `fieldErrors` state for immediate UI feedback.
    *   Mark required fields with a red asterisk `*`.
3.  **Action Execution**:
    ```tsx
    const res = await myAction(formData);
    if (res.error) {
        toast(res.error, "error");
    } else {
        toast("Success message", "success");
        router.refresh(); // Crucial for data sync
        onClose();
    }
    ```
4.  **Loading States**: Handle `pending` status using `useFormStatus` in separate submit buttons or local state.

## Step 4: Verification
1.  Verify the action is recorded in the **Audit Log**.
2.  Verify the UI updates immediately without manual page refresh.
3.  Check for edge cases (null values, long strings, zero values).

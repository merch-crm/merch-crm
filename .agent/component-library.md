# MerchCRM UI Component Library

Common patterns and components to maintain a premium, consistent design.

## Modals & Dialogs

### ConfirmDialog
Premium replacement for system confirm().
```tsx
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

<ConfirmDialog
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    onConfirm={handleAction}
    isLoading={isPending}
    title="Danger Title"
    description="Warning message goes here."
    confirmText="Action"
    variant="destructive" // destructive | default
/>
```

## Form Components

### Premium Input (Standard)
```tsx
<div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        Label <span className="text-rose-500">*</span>
    </label>
    <input
        className={cn(
            "w-full h-14 px-5 rounded-2xl border bg-slate-50 text-sm font-bold outline-none transition-all",
            error ? "border-rose-300 bg-rose-50/50" : "border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
        )}
    />
</div>
```

### SubmitButton (with Loading Spinner)
```tsx
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                </div>
            ) : "Save Changes"}
        </Button>
    );
}
```

## Data Table Elements

### Custom Pagination
```tsx
<Pagination
    currentPage={currentPage}
    totalItems={totalItems}
    pageSize={pageSize}
    onPageChange={setCurrentPage}
    itemName="records"
/>
```

### Styled Badges
Use `cn` for status-based coloring.
- **Emerald**: Success/In
- **Rose**: Danger/Out
- **Indigo**: Info/Transfer/Neutral
```tsx
<Badge className="bg-emerald-50 text-emerald-600 border-none shadow-none font-black text-xs px-3 py-1">
    Value
</Badge>
```

## Notifications
```tsx
const { toast } = useToast();
toast("Action successful!", "success"); // success | error | warning
```

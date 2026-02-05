# Design Rules

## Dialogs and Modals

### Window Headers & Field Labels
All labels for input fields, section headers inside forms, and mobile sheet headers should follow this standard style:
- **Color:** `text-slate-700`
- **Font Size:** `text-sm`
- **Font Weight:** `font-bold`
- **Margin:** `ml-1` (for input labels)

**Example:**
```tsx
<label className="text-sm font-bold text-slate-700 ml-1">
    Название поля
</label>
```

**Anti-patterns (DO NOT USE):**
- `text-[10px]`
- `uppercase`
- `tracking-widest`
- `text-slate-400` or `text-slate-500` (unless disabled)

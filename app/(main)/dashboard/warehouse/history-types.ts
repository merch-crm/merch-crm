export interface Transaction {
    id: string;
    type: "in" | "out" | "transfer" | "attribute_change" | "archive" | "restore";
    changeAmount: number;
    reason: string | null;
    createdAt: Date;
    item: {
        id: string;
        name: string;
        unit: string;
        sku: string | null;
        storageLocation?: {
            name: string;
        } | null;
    } | null;
    storageLocation: {
        name: string;
    } | null;
    fromStorageLocation: {
        name: string;
    } | null;
    creator: {
        name: string;
        avatar: string | null;
        role: {
            name: string;
        } | null;
    } | null;
}

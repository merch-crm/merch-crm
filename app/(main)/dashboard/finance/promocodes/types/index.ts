export interface Promocode {
    id: string;
    name: string | null;
    code: string;
    discountType: string;
    value: string;
    isActive: boolean;
    usageCount: number;
    usageLimit: number | null;
    expiresAt: string | Date | null;
    adminComment: string | null;
    minOrderAmount: string | null;
    totalSaved: number;
    createdAt: string | Date;
}

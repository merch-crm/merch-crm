export interface StorageLocation {
  id: string;
  name: string;
  address?: string | null;
  responsibleUserId?: string | null;
  description?: string | null;
  isSystem?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number | null;
  responsibleUser?: {
    name: string;
  } | null;
  type: "warehouse" | "production" | "office";
  createdAt?: Date;
  items?: StorageLocationItem[];
}

export interface StorageLocationItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  sku?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
}

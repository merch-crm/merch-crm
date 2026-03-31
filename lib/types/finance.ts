// @/lib/types/finance.ts

import type { BaseEntity, AuditInfo, DateRange } from "./common";
import type { ClientSummary } from "./client";
import type { OrderSummary, PaymentMethod } from "./order";
import type { UserSummary } from "./user";

// Статус платежа
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled";

// Тип платежа
export type PaymentType = "income" | "expense" | "refund" | "transfer";

// Категория расхода
export type ExpenseCategory =
    | "materials"
    | "salary"
    | "rent"
    | "utilities"
    | "marketing"
    | "equipment"
    | "shipping"
    | "taxes"
    | "other";

// Платёж
export interface Payment extends BaseEntity {
    type: PaymentType;
    status: PaymentStatus;
    method: PaymentMethod;
    isAdvance: boolean;
    comment?: string;

    // Суммы
    amount: number;
    currency: string;

    // Связи
    orderId?: string;
    order?: OrderSummary;
    clientId?: string;
    client?: ClientSummary;
    invoiceId?: string;
    invoice?: Invoice;

    // Реквизиты
    transactionId?: string;
    externalId?: string;

    // Даты
    paidAt?: Date;
    confirmedAt?: Date;

    // Расходы
    expenseCategory?: ExpenseCategory;

    // Дополнительно
    description?: string;
    notes?: string;
    attachments?: string[];

    // Автор
    userId?: string;
    user?: UserSummary;

    // Аудит
    audit?: AuditInfo;
    referenceNumber?: string;
    createdBy?: string;
}

// Счёт
export interface Invoice extends BaseEntity {
    number: string;
    type: "incoming" | "outgoing";
    status: InvoiceStatus;

    // Связи
    clientId: string;
    client?: ClientSummary;
    orderId?: string;
    order?: OrderSummary;

    // Суммы
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paidAmount: number;
    currency: string;

    // Позиции
    items: InvoiceItem[];

    // Даты
    issueDate: Date;
    dueDate: Date;
    paidAt?: Date;

    // Реквизиты
    bankDetails?: InvoiceBankDetails;
    companyDetails?: InvoiceCompanyDetails;

    // Дополнительно
    notes?: string;
    terms?: string;
    footer?: string;

    // Файлы
    pdfUrl?: string;

    // Аудит
    audit?: AuditInfo;
}

// Статус счёта
export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "partial" | "overdue" | "cancelled";

// Позиция счёта
export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
    total: number;
    productId?: string;
    productSku?: string;
}

// Банковские реквизиты счёта
export interface InvoiceBankDetails {
    bankName: string;
    bik: string;
    accountNumber: string;
    correspondentAccount: string;
}

// Реквизиты компании в счёте
export interface InvoiceCompanyDetails {
    name: string;
    inn: string;
    kpp?: string;
    ogrn?: string;
    address: string;
    phone?: string;
    email?: string;
}

// Разбивка стоимости
export interface PriceBreakdown {
    items: PriceBreakdownLine[];
    subtotal: number;
    discount: number;
    discountPercent?: number;
    shipping: number;
    tax?: number;
    total: number;
    currency: string;
}

export interface PriceBreakdownLine {
    id: string;
    type: PriceBreakdownLineType;
    label: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
    isNegative?: boolean;
    details?: PriceBreakdownLine[];
}

export type PriceBreakdownLineType =
    | "product"
    | "printing"
    | "service"
    | "discount"
    | "shipping"
    | "tax"
    | "subtotal"
    | "total";

// Финансовый отчёт
export interface FinancialReport {
    period: DateRange;
    income: FinancialSummary;
    expenses: FinancialSummary;
    profit: number;
    profitMargin: number;
    comparison?: {
        previousPeriod: DateRange;
        incomeChange: number;
        expensesChange: number;
        profitChange: number;
    };
}

export interface FinancialSummary {
    total: number;
    count: number;
    byCategory?: Record<string, number>;
    byMethod?: Record<PaymentMethod, number>;
    byDay?: Array<{ date: string; amount: number }>;
}

// Форма платежа
export interface PaymentFormData {
    type: PaymentType;
    method: PaymentMethod;
    amount: number;
    orderId?: string;
    clientId?: string;
    expenseCategory?: ExpenseCategory;
    description?: string;
    notes?: string;
    paidAt?: Date;
}

// Форма счёта
export interface InvoiceFormData {
    clientId: string;
    orderId?: string;
    items: InvoiceItemFormData[];
    discount?: number;
    tax?: number;
    dueDate: Date;
    notes?: string;
    terms?: string;
}

export interface InvoiceItemFormData {
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    productId?: string;
}

// Фильтры платежей
export interface PaymentFilters {
    type?: PaymentType;
    status?: PaymentStatus;
    method?: PaymentMethod;
    clientId?: string;
    orderId?: string;
    expenseCategory?: ExpenseCategory;
    dateRange?: DateRange;
    minAmount?: number;
    maxAmount?: number;
}

// Фильтры счетов
export interface InvoiceFilters {
    type?: "incoming" | "outgoing";
    status?: InvoiceStatus;
    clientId?: string;
    isOverdue?: boolean;
    dateRange?: DateRange;
}

import { Organization } from './organization.entity';
import { User } from './user.entity';
import { SaleItem } from './sale-item.entity';
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    DIGITAL_WALLET = "digital_wallet",
    BANK_TRANSFER = "bank_transfer"
}
export declare enum SaleStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare class Sale {
    id: string;
    invoiceNumber: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    status: SaleStatus;
    organizationId: string;
    cashierId: string;
    customerId: string;
    organization: Organization;
    cashier: User;
    items: SaleItem[];
    notes: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

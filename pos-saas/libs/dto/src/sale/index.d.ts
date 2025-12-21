export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    DIGITAL_WALLET = "digital_wallet",
    BANK_TRANSFER = "bank_transfer"
}
export declare class SaleItemDto {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    discount?: number;
}
export declare class CreateSaleDto {
    items: SaleItemDto[];
    paymentMethod: PaymentMethod;
    tax?: number;
    discount?: number;
    customerId?: string;
    notes?: string;
}

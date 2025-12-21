import { Sale } from './sale.entity';
import { Product } from './product.entity';
export declare class SaleItem {
    id: string;
    saleId: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    subtotal: number;
    sale: Sale;
    product: Product;
}

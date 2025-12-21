export declare class CreateProductDto {
    name: string;
    sku?: string;
    barcode?: string;
    description?: string;
    price: number;
    costPrice?: number;
    stock?: number;
    lowStockAlert?: number;
    category?: string;
    image?: string;
}
export declare class UpdateProductDto {
    name?: string;
    sku?: string;
    barcode?: string;
    description?: string;
    price?: number;
    costPrice?: number;
    stock?: number;
    lowStockAlert?: number;
    category?: string;
    image?: string;
    isActive?: boolean;
}

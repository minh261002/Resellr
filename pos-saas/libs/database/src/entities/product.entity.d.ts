import { Organization } from './organization.entity';
export declare class Product {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    description: string;
    price: number;
    costPrice: number;
    stock: number;
    lowStockAlert: number;
    category: string;
    image: string;
    isActive: boolean;
    organizationId: string;
    organization: Organization;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

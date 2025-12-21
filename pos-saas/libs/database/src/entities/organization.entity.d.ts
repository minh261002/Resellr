export declare class Organization {
    id: string;
    name: string;
    logo: string;
    phone: string;
    email: string;
    address: string;
    isActive: boolean;
    subscriptionPlan: string;
    subscriptionExpiresAt: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

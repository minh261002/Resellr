import { Organization } from './organization.entity';
export declare enum UserRole {
    OWNER = "owner",
    ADMIN = "admin",
    MANAGER = "manager",
    CASHIER = "cashier"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    avatar: string;
    phone: string;
    organizationId: string;
    organization: Organization;
    refreshToken: string;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

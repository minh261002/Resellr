export declare class CreateOrganizationDto {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}
export declare class UpdateOrganizationDto {
    name?: string;
    logo?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '@app/database';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '@app/dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.organizationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findByUserId(userId: string, organizationId: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create(createOrganizationDto);
    const saved = await this.organizationRepository.save(organization);

    this.logger.log(`Organization created: ${saved.name}`);
    return saved;
  }

  async update(
    id: string,
    organizationId: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    // Ensure user can only update their own organization
    if (id !== organizationId) {
      throw new ForbiddenException('Cannot update other organizations');
    }

    const organization = await this.findOne(id);

    Object.assign(organization, updateOrganizationDto);
    const updated = await this.organizationRepository.save(organization);

    this.logger.log(`Organization updated: ${updated.name}`);
    return updated;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    if (id !== organizationId) {
      throw new ForbiddenException('Cannot delete other organizations');
    }

    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);

    this.logger.log(`Organization deleted: ${organization.name}`);
  }
}

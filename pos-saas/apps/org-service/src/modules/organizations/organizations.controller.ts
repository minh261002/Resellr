import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '@app/dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.organizationsService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Body('organizationId') organizationId: string,
  ) {
    return this.organizationsService.update(id, organizationId, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('organizationId') organizationId: string) {
    return this.organizationsService.remove(id, organizationId);
  }

  // Microservice endpoints
  @MessagePattern('org.findOne')
  async findOneViaMessage(@Payload() data: { id: string }) {
    return this.organizationsService.findOne(data.id);
  }

  @MessagePattern('org.create')
  async createViaMessage(@Payload() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @MessagePattern('org.update')
  async updateViaMessage(
    @Payload() data: { id: string; organizationId: string; dto: UpdateOrganizationDto },
  ) {
    return this.organizationsService.update(data.id, data.organizationId, data.dto);
  }
}

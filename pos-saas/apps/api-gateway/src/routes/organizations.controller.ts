import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NatsClientService } from '../common/nats-client.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '@app/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly natsClient: NatsClientService) {}

  @Get()
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.natsClient.send('org.findAll', { page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.natsClient.send('org.findOne', { id });
  }

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.natsClient.send('org.create', createOrganizationDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Request() req: any,
  ) {
    return this.natsClient.send('org.update', {
      id,
      organizationId: req.user.organizationId,
      dto: updateOrganizationDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.natsClient.send('org.delete', {
      id,
      organizationId: req.user.organizationId,
    });
  }
}

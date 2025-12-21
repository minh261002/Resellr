import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NatsClientService } from '../common/nats-client.service';
import { CreateSaleDto } from '@app/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly natsClient: NatsClientService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.natsClient.send('sale.findAll', {
      organizationId: req.user.organizationId,
      page,
      limit,
      startDate,
      endDate,
      status,
    });
  }

  @Get('report')
  getReport(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.natsClient.send('sale.report', {
      organizationId: req.user.organizationId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }

  @Get('invoice/:invoiceNumber')
  findByInvoice(@Param('invoiceNumber') invoiceNumber: string, @Request() req: any) {
    return this.natsClient.send('sale.findByInvoice', {
      invoiceNumber,
      organizationId: req.user.organizationId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.natsClient.send('sale.findOne', {
      id,
      organizationId: req.user.organizationId,
    });
  }

  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
    return this.natsClient.send('sale.create', {
      dto: createSaleDto,
      organizationId: req.user.organizationId,
      cashierId: req.user.id,
    });
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.natsClient.send('sale.cancel', {
      id,
      organizationId: req.user.organizationId,
    });
  }
}

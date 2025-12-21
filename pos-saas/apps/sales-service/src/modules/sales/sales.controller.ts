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
import { SalesService } from './sales.service';
import { CreateSaleDto } from '@app/dto';
import { SaleStatus } from '@app/database';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: SaleStatus,
  ) {
    return this.salesService.findAll(
      organizationId,
      page,
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      status,
    );
  }

  @Get('report')
  getReport(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesService.getSalesReport(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('invoice/:invoiceNumber')
  findByInvoice(
    @Param('invoiceNumber') invoiceNumber: string,
    @Query('organizationId') organizationId: string,
  ) {
    return this.salesService.findByInvoice(invoiceNumber, organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('organizationId') organizationId: string) {
    return this.salesService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() createSaleDto: CreateSaleDto,
    @Body('organizationId') organizationId: string,
    @Body('cashierId') cashierId: string,
  ) {
    return this.salesService.create(createSaleDto, organizationId, cashierId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body('organizationId') organizationId: string) {
    return this.salesService.cancel(id, organizationId);
  }

  // Microservice endpoints
  @MessagePattern('sale.findOne')
  async findOneViaMessage(@Payload() data: { id: string; organizationId: string }) {
    return this.salesService.findOne(data.id, data.organizationId);
  }

  @MessagePattern('sale.create')
  async createViaMessage(
    @Payload()
    data: {
      dto: CreateSaleDto;
      organizationId: string;
      cashierId: string;
    },
  ) {
    return this.salesService.create(
      data.dto,
      data.organizationId,
      data.cashierId,
    );
  }

  @MessagePattern('sale.report')
  async getReportViaMessage(
    @Payload()
    data: {
      organizationId: string;
      startDate: Date;
      endDate: Date;
    },
  ) {
    return this.salesService.getSalesReport(
      data.organizationId,
      data.startDate,
      data.endDate,
    );
  }
}

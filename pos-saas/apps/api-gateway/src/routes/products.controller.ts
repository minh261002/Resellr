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
import { CreateProductDto, UpdateProductDto } from '@app/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '@app/common';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly natsClient: NatsClientService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.natsClient.send('product.findAll', {
      organizationId: req.user.organizationId,
      page,
      limit,
      search,
      category,
    });
  }

  @Get('low-stock')
  getLowStock(@Request() req: any) {
    return this.natsClient.send('product.lowStock', {
      organizationId: req.user.organizationId,
    });
  }

  @Get('barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string, @Request() req: any) {
    return this.natsClient.send('product.findByBarcode', {
      barcode,
      organizationId: req.user.organizationId,
    });
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string, @Request() req: any) {
    return this.natsClient.send('product.findBySku', {
      sku,
      organizationId: req.user.organizationId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.natsClient.send('product.findOne', {
      id,
      organizationId: req.user.organizationId,
    });
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    return this.natsClient.send('product.create', {
      dto: createProductDto,
      organizationId: req.user.organizationId,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    return this.natsClient.send('product.update', {
      id,
      dto: updateProductDto,
      organizationId: req.user.organizationId,
    });
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Request() req: any,
  ) {
    return this.natsClient.send('product.updateStock', {
      id,
      quantity,
      organizationId: req.user.organizationId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.natsClient.send('product.delete', {
      id,
      organizationId: req.user.organizationId,
    });
  }
}

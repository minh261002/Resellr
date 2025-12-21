import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ProductsService } from "./products.service";
import { CreateProductDto, UpdateProductDto } from "@app/dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query("organizationId") organizationId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("category") category?: string
  ) {
    return this.productsService.findAll(
      organizationId,
      page,
      limit,
      search,
      category
    );
  }

  @Get("low-stock")
  getLowStock(@Query("organizationId") organizationId: string) {
    return this.productsService.getLowStockProducts(organizationId);
  }

  @Get("barcode/:barcode")
  findByBarcode(
    @Param("barcode") barcode: string,
    @Query("organizationId") organizationId: string
  ) {
    return this.productsService.findByBarcode(barcode, organizationId);
  }

  @Get("sku/:sku")
  findBySku(
    @Param("sku") sku: string,
    @Query("organizationId") organizationId: string
  ) {
    return this.productsService.findBySku(sku, organizationId);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @Query("organizationId") organizationId: string
  ) {
    return this.productsService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @Body("organizationId") organizationId: string
  ) {
    return this.productsService.create(createProductDto, organizationId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Body("organizationId") organizationId: string
  ) {
    return this.productsService.update(id, organizationId, updateProductDto);
  }

  @Patch(":id/stock")
  updateStock(
    @Param("id") id: string,
    @Body("quantity") quantity: number,
    @Body("organizationId") organizationId: string
  ) {
    return this.productsService.updateStock(id, organizationId, quantity);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @Body("organizationId") organizationId: string
  ) {
    return this.productsService.remove(id, organizationId);
  }

  // Microservice endpoints
  @MessagePattern("product.findOne")
  async findOneViaMessage(
    @Payload() data: { id: string; organizationId: string }
  ) {
    return this.productsService.findOne(data.id, data.organizationId);
  }

  @MessagePattern("product.findByBarcode")
  async findByBarcodeViaMessage(
    @Payload() data: { barcode: string; organizationId: string }
  ) {
    return this.productsService.findByBarcode(
      data.barcode,
      data.organizationId
    );
  }

  @MessagePattern("product.create")
  async createViaMessage(
    @Payload() data: { dto: CreateProductDto; organizationId: string }
  ) {
    return this.productsService.create(data.dto, data.organizationId);
  }

  @MessagePattern("product.updateStock")
  async updateStockViaMessage(
    @Payload() data: { id: string; organizationId: string; quantity: number }
  ) {
    return this.productsService.updateStock(
      data.id,
      data.organizationId,
      data.quantity
    );
  }

  @MessagePattern("product.lowStock")
  async getLowStockViaMessage(@Payload() data: { organizationId: string }) {
    return this.productsService.getLowStockProducts(data.organizationId);
  }
}

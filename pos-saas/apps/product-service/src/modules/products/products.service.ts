import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '@app/database';
import { CreateProductDto, UpdateProductDto } from '@app/dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(
    organizationId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    category?: string,
  ) {
    const where: any = { organizationId };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (category) {
      where.category = category;
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
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

  async findOne(id: string, organizationId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, organizationId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByBarcode(barcode: string, organizationId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { barcode, organizationId },
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }

    return product;
  }

  async findBySku(sku: string, organizationId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { sku, organizationId },
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return product;
  }

  async create(
    createProductDto: CreateProductDto,
    organizationId: string,
  ): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      organizationId,
    });

    const saved = await this.productRepository.save(product);

    this.logger.log(
      `Product created: ${saved.name} for org ${organizationId}`,
    );
    return saved;
  }

  async update(
    id: string,
    organizationId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id, organizationId);

    Object.assign(product, updateProductDto);
    const updated = await this.productRepository.save(product);

    this.logger.log(`Product updated: ${updated.name}`);
    return updated;
  }

  async updateStock(
    id: string,
    organizationId: string,
    quantity: number,
  ): Promise<Product> {
    const product = await this.findOne(id, organizationId);

    product.stock += quantity;
    const updated = await this.productRepository.save(product);

    this.logger.log(
      `Product stock updated: ${updated.name}, new stock: ${updated.stock}`,
    );
    return updated;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const product = await this.findOne(id, organizationId);
    await this.productRepository.remove(product);

    this.logger.log(`Product deleted: ${product.name}`);
  }

  async getLowStockProducts(organizationId: string): Promise<Product[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.organizationId = :organizationId', { organizationId })
      .andWhere('product.stock <= product.lowStockAlert')
      .andWhere('product.lowStockAlert > 0')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getMany();

    return products;
  }
}

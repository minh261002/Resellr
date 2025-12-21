import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Sale, SaleItem, Product, SaleStatus } from '@app/database';
import { CreateSaleDto } from '@app/dto';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(
    organizationId: string,
    page: number = 1,
    limit: number = 20,
    startDate?: Date,
    endDate?: Date,
    status?: SaleStatus,
  ) {
    const where: any = { organizationId };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.saleRepository.findAndCount({
      where,
      relations: ['items', 'cashier'],
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

  async findOne(id: string, organizationId: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id, organizationId },
      relations: ['items', 'items.product', 'cashier'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async findByInvoice(
    invoiceNumber: string,
    organizationId: string,
  ): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { invoiceNumber, organizationId },
      relations: ['items', 'items.product', 'cashier'],
    });

    if (!sale) {
      throw new NotFoundException(
        `Sale with invoice ${invoiceNumber} not found`,
      );
    }

    return sale;
  }

  async create(
    createSaleDto: CreateSaleDto,
    organizationId: string,
    cashierId: string,
  ): Promise<Sale> {
    // Validate products and calculate totals
    let subtotal = 0;
    const saleItems: SaleItem[] = [];

    for (const item of createSaleDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId, organizationId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product ${item.productId} not found`,
        );
      }

      if (!product.isActive) {
        throw new BadRequestException(
          `Product ${product.name} is not active`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`,
        );
      }

      const itemSubtotal =
        item.unitPrice * item.quantity - (item.discount || 0);
      subtotal += itemSubtotal;

      const saleItem = this.saleItemRepository.create({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount || 0,
        subtotal: itemSubtotal,
      });

      saleItems.push(saleItem);
    }

    const tax = createSaleDto.tax || 0;
    const discount = createSaleDto.discount || 0;
    const total = subtotal + tax - discount;

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(organizationId);

    // Create sale
    const sale = this.saleRepository.create({
      invoiceNumber,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: createSaleDto.paymentMethod,
      status: SaleStatus.COMPLETED,
      organizationId,
      cashierId,
      customerId: createSaleDto.customerId,
      notes: createSaleDto.notes,
      items: saleItems,
    });

    const savedSale = await this.saleRepository.save(sale);

    // Update product stock
    for (const item of createSaleDto.items) {
      await this.productRepository.decrement(
        { id: item.productId },
        'stock',
        item.quantity,
      );
    }

    this.logger.log(
      `Sale created: ${savedSale.invoiceNumber} - Total: ${savedSale.total}`,
    );

    return this.findOne(savedSale.id, organizationId);
  }

  async cancel(id: string, organizationId: string): Promise<Sale> {
    const sale = await this.findOne(id, organizationId);

    if (sale.status === SaleStatus.CANCELLED) {
      throw new BadRequestException('Sale is already cancelled');
    }

    if (sale.status === SaleStatus.REFUNDED) {
      throw new BadRequestException('Cannot cancel a refunded sale');
    }

    sale.status = SaleStatus.CANCELLED;
    const updated = await this.saleRepository.save(sale);

    // Restore product stock
    for (const item of sale.items) {
      await this.productRepository.increment(
        { id: item.productId },
        'stock',
        item.quantity,
      );
    }

    this.logger.log(`Sale cancelled: ${updated.invoiceNumber}`);
    return updated;
  }

  async getSalesReport(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const sales = await this.saleRepository.find({
      where: {
        organizationId,
        createdAt: Between(startDate, endDate),
        status: SaleStatus.COMPLETED,
      },
      relations: ['items'],
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalItems = sales.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    return {
      period: { startDate, endDate },
      totalSales,
      totalRevenue,
      totalItems,
      averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    };
  }

  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const prefix = `INV-${year}${month}${day}`;

    const lastSale = await this.saleRepository.findOne({
      where: {
        organizationId,
        invoiceNumber: Like(`${prefix}%`),
      },
      order: { createdAt: 'DESC' },
    });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.invoiceNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
}

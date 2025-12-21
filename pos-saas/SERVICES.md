# 🎉 POS SaaS Backend - Hoàn thành!

## ✅ Microservices đã tạo (5 services)

### 1. **Auth Service** (Port 3001)
Xử lý authentication và authorization

**Features:**
- User registration + auto-create organization
- JWT authentication (access + refresh tokens)
- Password hashing với bcrypt
- Trial subscription (30 days)
- Role-based access (owner, admin, manager, cashier)

**Endpoints:**
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `GET /auth/profile` - User profile
- `POST /auth/refresh` - Refresh token

**NATS Messages:** `auth.validate`, `auth.login`, `auth.register`

---

### 2. **Organizations Service** (Port 3002)
Quản lý organizations (multi-tenancy)

**Features:**
- CRUD organizations
- Multi-tenancy security
- Subscription management
- Pagination support

**Endpoints:**
- `GET /organizations` - List all
- `GET /organizations/:id` - Get one
- `POST /organizations` - Create
- `PATCH /organizations/:id` - Update
- `DELETE /organizations/:id` - Delete

**NATS Messages:** `org.findOne`, `org.create`, `org.update`

---

### 3. **Product Service** (Port 3003) ⭐ NEW
Quản lý sản phẩm và inventory

**Features:**
- CRUD products
- Search by name, barcode, SKU
- Filter by category
- Stock management
- Low stock alerts
- Multi-tenancy support

**Endpoints:**
- `GET /products` - List products (pagination + search + filter)
- `GET /products/:id` - Get one product
- `GET /products/barcode/:barcode` - Find by barcode (POS scan)
- `GET /products/sku/:sku` - Find by SKU
- `GET /products/low-stock` - Products with low stock
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `PATCH /products/:id/stock` - Update stock quantity
- `DELETE /products/:id` - Delete product

**NATS Messages:**
- `product.findOne` - Get product
- `product.findByBarcode` - POS barcode scan
- `product.create` - Create product
- `product.updateStock` - Update inventory
- `product.lowStock` - Get low stock products

---

### 4. **Sales Service** (Port 3004) ⭐ NEW
Xử lý POS transactions

**Features:**
- Create sales/transactions
- Auto-generate invoice numbers
- Stock validation and update
- Calculate subtotal, tax, discount, total
- Cancel sales (restore stock)
- Sales reports
- Transaction history

**Endpoints:**
- `GET /sales` - List sales (pagination + filters)
- `GET /sales/:id` - Get one sale
- `GET /sales/invoice/:invoiceNumber` - Find by invoice
- `GET /sales/report` - Sales report (revenue, items, avg)
- `POST /sales` - Create new sale (POS checkout)
- `PATCH /sales/:id/cancel` - Cancel sale

**NATS Messages:**
- `sale.findOne` - Get sale details
- `sale.create` - Create transaction
- `sale.report` - Get sales report

**Business Logic:**
- Validates product availability
- Checks stock before sale
- Auto-decrements product stock
- Generates unique invoice numbers (INV-YYYYMMDD-XXXX)
- Restores stock when cancelled

---

## 📊 Database Schema (PostgreSQL)

**5 Main Tables:**

1. **organizations** - Tenants
   - Multi-tenancy base table
   - Subscription management

2. **users** - Authentication
   - Linked to organization
   - Roles: owner, admin, manager, cashier

3. **products** - Inventory
   - SKU, barcode, price, stock
   - Low stock alerts
   - Scoped by organizationId

4. **sales** - Transactions
   - Invoice numbers
   - Payment methods
   - Status: pending, completed, cancelled, refunded

5. **sale_items** - Line items
   - Product snapshot (name, price at time of sale)
   - Quantity, discount, subtotal

**Relationships:**
- All tables scoped by `organizationId` (multi-tenancy)
- Sales → SaleItems (one-to-many)
- Sales → User (cashier)
- SaleItems → Product

---

## 🚀 Quick Start Guide

### 1. Start Infrastructure
```bash
# Start PostgreSQL, Redis, NATS
pnpm docker:up

# Verify
docker ps
```

### 2. Start All Services
```bash
# Terminal 1: Auth Service
pnpm dev:auth

# Terminal 2: Organizations Service
pnpm dev:org

# Terminal 3: Product Service
pnpm dev:product

# Terminal 4: Sales Service
pnpm dev:sales
```

### 3. Test Complete Flow

#### A. Register Organization + User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@mystore.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "organizationName": "My Coffee Shop"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "owner@mystore.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "owner",
    "organizationId": "org-uuid"
  }
}
```

#### B. Create Products
```bash
# Use organizationId from register response
ORG_ID="your-org-uuid"

curl -X POST http://localhost:3003/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Espresso",
    "sku": "COFFEE-ESP-001",
    "barcode": "1234567890123",
    "price": 3.50,
    "costPrice": 1.50,
    "stock": 100,
    "lowStockAlert": 20,
    "category": "Coffee",
    "organizationId": "'$ORG_ID'"
  }'

curl -X POST http://localhost:3003/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cappuccino",
    "sku": "COFFEE-CAP-001",
    "barcode": "1234567890124",
    "price": 4.50,
    "costPrice": 2.00,
    "stock": 100,
    "lowStockAlert": 20,
    "category": "Coffee",
    "organizationId": "'$ORG_ID'"
  }'
```

#### C. Create Sale (POS Checkout)
```bash
# Use product IDs from previous response
PRODUCT_ID_1="product-uuid-1"
PRODUCT_ID_2="product-uuid-2"
CASHIER_ID="user-uuid"

curl -X POST http://localhost:3004/sales \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "'$PRODUCT_ID_1'",
        "productName": "Espresso",
        "unitPrice": 3.50,
        "quantity": 2
      },
      {
        "productId": "'$PRODUCT_ID_2'",
        "productName": "Cappuccino",
        "unitPrice": 4.50,
        "quantity": 1
      }
    ],
    "paymentMethod": "cash",
    "tax": 1.15,
    "discount": 0,
    "organizationId": "'$ORG_ID'",
    "cashierId": "'$CASHIER_ID'"
  }'
```

Response:
```json
{
  "id": "sale-uuid",
  "invoiceNumber": "INV-20231221-0001",
  "subtotal": 11.50,
  "tax": 1.15,
  "discount": 0,
  "total": 12.65,
  "paymentMethod": "cash",
  "status": "completed",
  "items": [
    {
      "productName": "Espresso",
      "quantity": 2,
      "unitPrice": 3.50,
      "subtotal": 7.00
    },
    {
      "productName": "Cappuccino",
      "quantity": 1,
      "unitPrice": 4.50,
      "subtotal": 4.50
    }
  ],
  "createdAt": "2023-12-21T10:30:00Z"
}
```

#### D. Get Sales Report
```bash
curl "http://localhost:3004/sales/report?organizationId=$ORG_ID&startDate=2023-12-01&endDate=2023-12-31"
```

Response:
```json
{
  "period": {
    "startDate": "2023-12-01",
    "endDate": "2023-12-31"
  },
  "totalSales": 1,
  "totalRevenue": 12.65,
  "totalItems": 3,
  "averageSaleValue": 12.65
}
```

#### E. Check Low Stock
```bash
curl "http://localhost:3003/products/low-stock?organizationId=$ORG_ID"
```

---

## 📦 Project Structure

```
pos-saas/
├── apps/
│   ├── auth-service/       ✅ Authentication
│   ├── org-service/        ✅ Multi-tenancy
│   ├── product-service/    ✅ Inventory
│   └── sales-service/      ✅ POS/Transactions
├── libs/
│   ├── common/            ✅ Shared utilities
│   ├── database/          ✅ Entities & config
│   └── dto/               ✅ Validation DTOs
├── docker-compose.yml     ✅ PostgreSQL + Redis + NATS
├── DEVELOPMENT.md         ✅ Dev guide
└── README.md             ✅ Overview
```

---

## 🔧 Available Commands

```bash
# Development
pnpm dev:auth      # Start auth service
pnpm dev:org       # Start org service
pnpm dev:product   # Start product service
pnpm dev:sales     # Start sales service

# Build
pnpm run build     # Build all services

# Docker
pnpm docker:up     # Start infrastructure
pnpm docker:down   # Stop infrastructure
```

---

## 🎯 What's Next?

### Option 1: API Gateway
Tạo API Gateway để:
- Route requests tới các microservices
- Centralized authentication
- Rate limiting
- Request/response logging

### Option 2: Frontend
Tạo Next.js frontend với:
- Admin dashboard
- POS interface
- Product management
- Sales reports
- Real-time updates

### Option 3: Additional Features
- Customer management (CRM)
- Employee management
- Promotions & discounts
- Multi-location support
- Receipt printing
- Payment gateway integration (VNPay, MoMo)

---

**🎉 Backend microservices architecture hoàn chỉnh!**

**Built with:** NestJS 11 + TypeORM + PostgreSQL + NATS + Redis

# 🚪 API Gateway - Complete Guide

## 🎯 Overview

API Gateway là **single entry point** cho tất cả client requests. Nó routing requests tới các microservices thông qua NATS messaging.

**Port**: `3000`
**Base URL**: `http://localhost:3000/api`

---

## 🏗️ Architecture

```
Client (Frontend/Mobile)
        ↓
   API Gateway (Port 3000)
        ↓ (NATS)
   ┌────┴────┬────────┬─────────┐
   ↓         ↓        ↓         ↓
Auth     Org      Product    Sales
Service  Service  Service  Service
(3001)   (3002)   (3003)   (3004)
```

**Benefits:**
- ✅ Single entry point - dễ manage
- ✅ Centralized authentication - JWT validation ở 1 nơi
- ✅ Hide microservices architecture từ clients
- ✅ Easy to add rate limiting, logging, caching
- ✅ CORS configuration ở 1 nơi

---

## 🔐 Authentication Flow

### 1. Public Endpoints (No Auth)
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### 2. Protected Endpoints (Require JWT)
Tất cả endpoints khác cần `Authorization: Bearer <token>` header

**JWT Payload:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "owner",
  "organizationId": "org-uuid"
}
```

**Gateway tự động:**
- Validate JWT token
- Extract user info
- Inject `organizationId` vào requests
- Route tới microservice phù hợp

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "owner@store.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Store"
}

# Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "owner@store.com",
    "role": "owner",
    "organizationId": "org-uuid"
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "owner@store.com",
  "password": "password123"
}

# Response: Same as register
```

#### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer <access_token>

# Response
{
  "id": "uuid",
  "email": "owner@store.com",
  "role": "owner",
  "organizationId": "org-uuid"
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer <access_token>

# Response: New tokens
```

---

### Organizations (`/api/organizations`)

**All endpoints require authentication**

```bash
GET /api/organizations?page=1&limit=10
GET /api/organizations/:id
POST /api/organizations
PATCH /api/organizations/:id
DELETE /api/organizations/:id
```

---

### Products (`/api/products`)

**All endpoints require authentication**

#### List Products
```bash
GET /api/products?page=1&limit=20&search=coffee&category=drinks
Authorization: Bearer <token>
```

#### Get Low Stock
```bash
GET /api/products/low-stock
Authorization: Bearer <token>
```

#### Find by Barcode (POS Scan)
```bash
GET /api/products/barcode/1234567890123
Authorization: Bearer <token>
```

#### Find by SKU
```bash
GET /api/products/sku/PROD-001
Authorization: Bearer <token>
```

#### Get One Product
```bash
GET /api/products/:id
Authorization: Bearer <token>
```

#### Create Product
```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Espresso",
  "sku": "COFFEE-ESP-001",
  "barcode": "1234567890123",
  "price": 3.50,
  "costPrice": 1.50,
  "stock": 100,
  "lowStockAlert": 20,
  "category": "Coffee"
}
```

#### Update Product
```bash
PATCH /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 4.00,
  "stock": 150
}
```

#### Update Stock
```bash
PATCH /api/products/:id/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": -5
}
```

#### Delete Product
```bash
DELETE /api/products/:id
Authorization: Bearer <token>
```

---

### Sales (`/api/sales`)

**All endpoints require authentication**

#### List Sales
```bash
GET /api/sales?page=1&limit=20&startDate=2023-12-01&endDate=2023-12-31&status=completed
Authorization: Bearer <token>
```

#### Get Sales Report
```bash
GET /api/sales/report?startDate=2023-12-01&endDate=2023-12-31
Authorization: Bearer <token>

# Response
{
  "period": { "startDate": "...", "endDate": "..." },
  "totalSales": 150,
  "totalRevenue": 5420.50,
  "totalItems": 450,
  "averageSaleValue": 36.14
}
```

#### Find by Invoice
```bash
GET /api/sales/invoice/INV-20231221-0001
Authorization: Bearer <token>
```

#### Get One Sale
```bash
GET /api/sales/:id
Authorization: Bearer <token>
```

#### Create Sale (POS Checkout)
```bash
POST /api/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product-uuid-1",
      "productName": "Espresso",
      "unitPrice": 3.50,
      "quantity": 2,
      "discount": 0
    },
    {
      "productId": "product-uuid-2",
      "productName": "Cappuccino",
      "unitPrice": 4.50,
      "quantity": 1,
      "discount": 0.50
    }
  ],
  "paymentMethod": "cash",
  "tax": 1.00,
  "discount": 0,
  "notes": "Customer requested extra hot"
}

# Response
{
  "id": "sale-uuid",
  "invoiceNumber": "INV-20231221-0001",
  "subtotal": 11.00,
  "tax": 1.00,
  "discount": 0,
  "total": 12.00,
  "paymentMethod": "cash",
  "status": "completed",
  "items": [...],
  "createdAt": "2023-12-21T10:30:00Z"
}
```

#### Cancel Sale
```bash
PATCH /api/sales/:id/cancel
Authorization: Bearer <token>

# Automatically restores product stock
```

---

## 🚀 Start Guide

### 1. Start All Services

```bash
# Terminal 1: Infrastructure
pnpm docker:up

# Terminal 2: Auth Service
pnpm dev:auth

# Terminal 3: Organizations Service
pnpm dev:org

# Terminal 4: Product Service
pnpm dev:product

# Terminal 5: Sales Service
pnpm dev:sales

# Terminal 6: API Gateway
pnpm dev:gateway
```

### 2. Test Complete Flow

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mystore.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "organizationName": "My Coffee Shop"
  }'

# Save the accessToken from response
TOKEN="your-access-token-here"

# 2. Create Product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Latte",
    "sku": "COFFEE-LAT-001",
    "barcode": "1234567890125",
    "price": 4.50,
    "stock": 100,
    "category": "Coffee"
  }'

# Save the product ID
PRODUCT_ID="product-uuid-here"

# 3. Scan Barcode (POS)
curl http://localhost:3000/api/products/barcode/1234567890125 \
  -H "Authorization: Bearer $TOKEN"

# 4. Create Sale
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{
      "productId": "'$PRODUCT_ID'",
      "productName": "Latte",
      "unitPrice": 4.50,
      "quantity": 2
    }],
    "paymentMethod": "cash",
    "tax": 0.90
  }'

# 5. Get Sales Report
curl "http://localhost:3000/api/sales/report?startDate=2023-12-01&endDate=2023-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Features

### Auto-injection
Gateway tự động inject:
- `organizationId` từ JWT vào mọi request
- `cashierId` (user.id) vào sales creation

### Security
- JWT validation trước khi route
- Multi-tenancy isolation (mỗi org chỉ thấy data của mình)
- CORS configured

### Error Handling
- Microservice errors được propagate về client
- Consistent error format

---

## 📊 Request Flow Example

**Create Product Request:**

```
1. Client sends:
   POST /api/products
   Authorization: Bearer eyJhbG...
   Body: { "name": "Coffee", "price": 5 }

2. API Gateway:
   ✓ Validates JWT
   ✓ Extracts: organizationId = "org-123"
   ✓ Sends NATS message: product.create
     {
       dto: { name: "Coffee", price: 5 },
       organizationId: "org-123"
     }

3. Product Service:
   ✓ Receives NATS message
   ✓ Creates product with organizationId
   ✓ Returns product data

4. API Gateway:
   ✓ Returns response to client
```

---

## 🎯 Next Steps

### Potential Enhancements:
1. **Rate Limiting** - Prevent abuse
2. **Request Logging** - Track all requests
3. **Response Caching** - Redis cache for GET requests
4. **API Versioning** - `/api/v1`, `/api/v2`
5. **WebSocket Gateway** - Real-time updates
6. **API Documentation** - Swagger/OpenAPI
7. **Health Checks** - `/health`, `/metrics`

---

**🎉 API Gateway hoàn thành!**

**All requests now go through:** `http://localhost:3000/api/*`

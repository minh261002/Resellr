# POS SaaS - Development Guide

## ✅ Đã hoàn thành

### 1. Cấu trúc Project
```
pos-saas/
├── apps/                    # Microservices
│   ├── auth-service/       # Authentication (Port 3001) ✅
│   └── org-service/        # Organizations (Port 3002) ✅
├── libs/                    # Shared libraries
│   ├── common/             # Decorators, Filters ✅
│   ├── database/           # Entities, DB Config ✅
│   └── dto/                # Data Transfer Objects ✅
└── docker-compose.yml      # Infrastructure ✅
```

### 2. Infrastructure (Docker)
- PostgreSQL 17 (Port 5432)
- Redis 7.4 (Port 6379)
- NATS 2.10 (Port 4222)

### 3. Shared Libraries

**@app/common**: Common utilities
- `@CurrentUser()` - Get current user from JWT
- `@Roles(...roles)` - Role-based access control
- `AllExceptionsFilter` - Global error handler

**@app/database**: Database entities
- Organization (multi-tenancy)
- User (với roles: owner, admin, manager, cashier)
- Product (inventory)
- Sale & SaleItem (POS transactions)

**@app/dto**: Data validation
- Auth: Login, Register
- Organization: Create, Update
- Product: Create, Update
- Sale: CreateSale

### 4. Microservices

#### Auth Service (Port 3001)
**Features:**
- User registration với auto-create organization
- JWT authentication (access + refresh tokens)
- Login/Logout
- Password hashing với bcrypt
- Trial subscription (30 days)

**Endpoints:**
- `POST /auth/register` - Đăng ký user mới + organization
- `POST /auth/login` - Đăng nhập
- `GET /auth/profile` - Lấy thông tin user (protected)
- `POST /auth/refresh` - Refresh token (protected)

**NATS Messages:**
- `auth.validate` - Validate user
- `auth.login` - Login via message
- `auth.register` - Register via message

#### Organizations Service (Port 3002)
**Features:**
- CRUD organizations
- Multi-tenancy security
- Pagination support
- Subscription management

**Endpoints:**
- `GET /organizations` - List all (with pagination)
- `GET /organizations/:id` - Get one
- `POST /organizations` - Create new
- `PATCH /organizations/:id` - Update
- `DELETE /organizations/:id` - Delete

**NATS Messages:**
- `org.findOne` - Find organization
- `org.create` - Create organization
- `org.update` - Update organization

## 🚀 Quick Start

### 1. Setup môi trường

```bash
# Copy environment variables
cp .env.example .env

# Install dependencies (đã xong)
pnpm install

# Build shared libraries (đã xong)
cd libs/common && pnpm run build
cd libs/database && pnpm run build
cd libs/dto && pnpm run build
```

### 2. Start infrastructure

```bash
# Start PostgreSQL, Redis, NATS
pnpm docker:up

# Check status
docker ps
```

### 3. Start services

```bash
# Terminal 1: Auth Service
cd apps/auth-service
pnpm run dev

# Terminal 2: Organizations Service
cd apps/org-service
pnpm run dev
```

## 📝 Testing APIs

### Register user + organization

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "organizationName": "My Store"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Get Profile (với access token)

```bash
curl http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### List Organizations

```bash
curl http://localhost:3002/organizations?page=1&limit=10
```

## 🔧 Build & Deploy

### Build tất cả services

```bash
# Build shared libs
pnpm --filter "@app/*" run build

# Build services
cd apps/auth-service && pnpm run build
cd apps/org-service && pnpm run build
```

### Production start

```bash
cd apps/auth-service && pnpm run start:prod
cd apps/org-service && pnpm run start:prod
```

## 📦 Cần làm tiếp

1. **Product Service** - Quản lý sản phẩm, inventory
2. **Sales Service** - POS transactions
3. **API Gateway** - Route requests, authentication middleware
4. **Frontend** - Next.js admin dashboard + POS interface

## 🏗️ Architecture Notes

### Multi-tenancy
- Mọi data được scope theo `organizationId`
- User chỉ access data của organization họ
- Owner role tự động được tạo khi register

### Communication
- HTTP REST APIs cho external clients
- NATS messaging cho inter-service communication
- Redis cho caching và sessions

### Security
- JWT tokens (7 days access, 30 days refresh)
- Bcrypt password hashing (10 rounds)
- Role-based access control
- CORS enabled

### Database
- PostgreSQL với TypeORM
- Auto-sync trong development mode
- Migrations cho production
- Indexes trên organizationId, email, etc.

## 🐛 Troubleshooting

### Lỗi database connection
```bash
# Check PostgreSQL
docker logs pos-postgres

# Restart
pnpm docker:down && pnpm docker:up
```

### Lỗi NATS connection
```bash
# Check NATS
docker logs pos-nats

# Test connection
telnet localhost 4222
```

### TypeScript errors
```bash
# Rebuild shared libs
cd libs/common && pnpm run build
cd libs/database && pnpm run build
cd libs/dto && pnpm run build
```

---

**Created with NestJS 11 + TypeORM + PostgreSQL + NATS + Redis**

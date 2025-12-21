# POS SaaS - Microservices Architecture

A modern Point of Sale SaaS application built with NestJS microservices architecture.

## Architecture

This project follows a microservices architecture pattern with the following services:

### Services

1. **API Gateway** - Entry point for all client requests
2. **Auth Service** - Authentication and authorization
3. **Organizations Service** - Multi-tenancy management
4. **Products Service** - Product and inventory management
5. **Sales Service** - POS transactions and orders

### Tech Stack

- **Framework**: NestJS (latest)
- **Database**: PostgreSQL with TypeORM
- **Message Broker**: NATS
- **Cache**: Redis
- **Language**: TypeScript
- **Package Manager**: pnpm

## Project Structure

```
pos-saas/
├── apps/
│   ├── api-gateway/       # API Gateway service
│   ├── auth-service/      # Authentication microservice
│   ├── org-service/       # Organizations microservice
│   ├── product-service/   # Products microservice
│   └── sales-service/     # Sales/POS microservice
├── libs/
│   ├── common/           # Shared utilities and decorators
│   ├── database/         # Database configurations
│   └── dto/              # Shared DTOs and interfaces
└── docker/               # Docker configurations
```

## Getting Started

Coming soon...
